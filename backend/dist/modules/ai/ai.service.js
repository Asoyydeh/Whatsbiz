"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const axios_1 = require("axios");
let AiService = AiService_1 = class AiService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiService_1.name);
    }
    async getAgentConfig(tenantId) {
        let config = await this.prisma.aiAgentConfig.findUnique({
            where: { tenant_id: tenantId },
        });
        if (!config) {
            config = await this.prisma.aiAgentConfig.create({
                data: {
                    tenant_id: tenantId,
                    is_active: false,
                    system_prompt: 'Anda adalah asisten AI toko online UMKM. Jawab pertanyaan pelanggan dengan ramah, singkat, dan informatif.',
                    primary_provider: 'gemini',
                },
            });
        }
        return config;
    }
    async updateAgentConfig(tenantId, data) {
        const config = await this.getAgentConfig(tenantId);
        return this.prisma.aiAgentConfig.update({
            where: { id: config.id },
            data: {
                is_active: data.is_active !== undefined ? data.is_active : config.is_active,
                system_prompt: data.system_prompt !== undefined ? data.system_prompt : config.system_prompt,
                catalog_data: data.catalog_data !== undefined ? data.catalog_data : config.catalog_data,
                gemini_api_key: data.gemini_api_key !== undefined ? data.gemini_api_key : config.gemini_api_key,
                groq_api_key: data.groq_api_key !== undefined ? data.groq_api_key : config.groq_api_key,
                cohere_api_key: data.cohere_api_key !== undefined ? data.cohere_api_key : config.cohere_api_key,
                openrouter_key: data.openrouter_key !== undefined ? data.openrouter_key : config.openrouter_key,
                primary_provider: data.primary_provider !== undefined ? data.primary_provider : config.primary_provider,
                temperature: data.temperature !== undefined ? parseFloat(data.temperature) : config.temperature,
            },
        });
    }
    async getRouterLogs(tenantId, limit = 20) {
        return this.prisma.aiRouterLog.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: 'desc' },
            take: limit,
        });
    }
    async getStats(tenantId) {
        const logs = await this.prisma.aiRouterLog.findMany({
            where: { tenant_id: tenantId },
        });
        const total = logs.length;
        const success = logs.filter((l) => l.status === 'success').length;
        const fallbackCount = logs.filter((l) => l.fallback_used && l.status === 'success').length;
        const failed = logs.filter((l) => l.status === 'failed').length;
        const totalLatency = logs.reduce((acc, l) => acc + l.latency_ms, 0);
        const avgLatency = total > 0 ? Math.round(totalLatency / total) : 0;
        const providerStats = logs.reduce((acc, l) => {
            if (l.status === 'success') {
                acc[l.provider] = (acc[l.provider] || 0) + 1;
            }
            return acc;
        }, {});
        return {
            total,
            success,
            fallbackCount,
            failed,
            avgLatency,
            providerStats,
        };
    }
    async generateResponse(tenantId, prompt, history) {
        const config = await this.getAgentConfig(tenantId);
        const providersQueue = ['gemini', 'groq', 'cohere', 'openrouter'];
        const startIndex = providersQueue.indexOf(config.primary_provider);
        const activeQueue = [
            ...providersQueue.slice(startIndex),
            ...providersQueue.slice(0, startIndex),
        ];
        let lastError = null;
        for (let i = 0; i < activeQueue.length; i++) {
            const provider = activeQueue[i];
            const isFallback = i > 0;
            const apiKey = this.getApiKeyForProvider(config, provider);
            if (!apiKey) {
                this.logger.warn(`API Key untuk ${provider} kosong. Mencoba provider berikutnya...`);
                continue;
            }
            const start = Date.now();
            try {
                let responseText = '';
                let finalPrompt = config.system_prompt;
                if (config.catalog_data && config.catalog_data.trim().length > 0) {
                    finalPrompt += `\n\n[KATALOG PRODUK (WAJIB JADIKAN REFERENSI UTAMA PENGETAHUANMU)]:\n${config.catalog_data}`;
                }
                if (provider === 'gemini') {
                    responseText = await this.callGemini(apiKey, finalPrompt, prompt, history, config.temperature);
                }
                else if (provider === 'groq') {
                    responseText = await this.callGroq(apiKey, finalPrompt, prompt, history, config.temperature);
                }
                else if (provider === 'cohere') {
                    responseText = await this.callCohere(apiKey, finalPrompt, prompt, history, config.temperature);
                }
                else if (provider === 'openrouter') {
                    responseText = await this.callOpenRouter(apiKey, finalPrompt, prompt, history, config.temperature);
                }
                const latency = Date.now() - start;
                await this.prisma.aiRouterLog.create({
                    data: {
                        tenant_id: tenantId,
                        provider,
                        fallback_used: isFallback,
                        status: 'success',
                        latency_ms: latency,
                    },
                });
                this.logger.log(`AI sukses merespon menggunakan ${provider} dalam ${latency}ms (Fallback: ${isFallback})`);
                return responseText;
            }
            catch (err) {
                const latency = Date.now() - start;
                const errMsg = err.response?.data?.error?.message || err.message || 'Unknown error';
                this.logger.error(`AI provider ${provider} gagal: ${errMsg}`);
                await this.prisma.aiRouterLog.create({
                    data: {
                        tenant_id: tenantId,
                        provider,
                        fallback_used: isFallback,
                        status: 'failed',
                        latency_ms: latency,
                        error_message: errMsg.substring(0, 255),
                    },
                });
                lastError = err;
            }
        }
        this.logger.error('Seluruh penyedia AI gagal merespon atau kunci API belum dikonfigurasi.');
        if (!config.gemini_api_key && !config.groq_api_key && !config.cohere_api_key && !config.openrouter_key) {
            return `[Bot Simulasi]: Halo! Saya adalah AI Agent Toko Anda. (Saat ini bot berjalan dalam Mode Simulasi karena Anda belum memasukkan API Key di Pengaturan AI). Pesan Anda: "${prompt}"`;
        }
        return 'Maaf, asisten AI kami sedang sibuk saat ini. Silakan coba kembali dalam beberapa saat.';
    }
    getApiKeyForProvider(config, provider) {
        switch (provider) {
            case 'gemini':
                return config.gemini_api_key;
            case 'groq':
                return config.groq_api_key;
            case 'cohere':
                return config.cohere_api_key;
            case 'openrouter':
                return config.openrouter_key;
            default:
                return null;
        }
    }
    async callGemini(apiKey, systemPrompt, prompt, history, temperature) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
        const contents = [];
        contents.push({
            role: 'user',
            parts: [{ text: `System Instruction / Role: ${systemPrompt}\n\n[ATURAN PENTING GAMBAR: Jika pelanggan meminta gambar produk dan Anda tidak memiliki link asli, Anda BISA membuatnya dengan membalas menggunakan kode: [GAMBAR: https://image.pollinations.ai/prompt/deskripsi%20produk%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Contoh: [GAMBAR: https://image.pollinations.ai/prompt/a%20plain%20white%20t-shirt%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Wajib gunakan awalan [GAMBAR: dan akhiran ]]. Ikuti kepribadian di atas untuk menjawab semua chat.` }]
        });
        contents.push({
            role: 'model',
            parts: [{ text: 'Baik, saya mengerti peranan dan aturan asisten toko online tersebut. Saya akan menjawab chat pelanggan berikutnya sesuai dengan instruksi yang diberikan.' }]
        });
        history.forEach((h) => {
            contents.push({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }],
            });
        });
        contents.push({
            role: 'user',
            parts: [{ text: prompt }],
        });
        const response = await axios_1.default.post(url, {
            contents,
            generationConfig: {
                temperature,
            },
        }, { timeout: 10000 });
        const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text)
            throw new Error('Format respon Gemini tidak valid');
        return text;
    }
    async callGroq(apiKey, systemPrompt, prompt, history, temperature) {
        const url = 'https://api.groq.com/openai/v1/chat/completions';
        const enhancedPrompt = `${systemPrompt}\n\n[ATURAN PENTING GAMBAR: Jika pelanggan meminta gambar produk dan Anda tidak memiliki link asli, Anda BISA membuatnya dengan membalas menggunakan kode: [GAMBAR: https://image.pollinations.ai/prompt/deskripsi%20produk%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Contoh: [GAMBAR: https://image.pollinations.ai/prompt/a%20plain%20white%20t-shirt%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Wajib gunakan awalan [GAMBAR: dan akhiran ]].`;
        const messages = [
            { role: 'system', content: enhancedPrompt },
            ...history.map((h) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content,
            })),
            { role: 'user', content: prompt },
        ];
        const response = await axios_1.default.post(url, {
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        const text = response.data?.choices?.[0]?.message?.content;
        if (!text)
            throw new Error('Format respon Groq tidak valid');
        return text;
    }
    async callCohere(apiKey, systemPrompt, prompt, history, temperature) {
        const url = 'https://api.cohere.com/v1/chat';
        const chatHistory = history.map((h) => ({
            role: h.role === 'user' ? 'USER' : 'CHATBOT',
            message: h.content,
        }));
        const enhancedPrompt = `${systemPrompt}\n\n[ATURAN PENTING GAMBAR: Jika pelanggan meminta gambar produk dan Anda tidak memiliki link asli, Anda BISA membuatnya dengan membalas menggunakan kode: [GAMBAR: https://image.pollinations.ai/prompt/deskripsi%20produk%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Contoh: [GAMBAR: https://image.pollinations.ai/prompt/a%20plain%20white%20t-shirt%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Wajib gunakan awalan [GAMBAR: dan akhiran ]].`;
        const response = await axios_1.default.post(url, {
            message: prompt,
            preamble: enhancedPrompt,
            chat_history: chatHistory,
            temperature,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });
        const text = response.data?.text;
        if (!text)
            throw new Error('Format respon Cohere tidak valid');
        return text;
    }
    async callOpenRouter(apiKey, systemPrompt, prompt, history, temperature) {
        const url = 'https://openrouter.ai/api/v1/chat/completions';
        const enhancedPrompt = `${systemPrompt}\n\n[ATURAN PENTING GAMBAR: Jika pelanggan meminta gambar produk dan Anda tidak memiliki link asli, Anda BISA membuatnya dengan membalas menggunakan kode: [GAMBAR: https://image.pollinations.ai/prompt/deskripsi%20produk%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Contoh: [GAMBAR: https://image.pollinations.ai/prompt/a%20plain%20white%20t-shirt%20product%20photography%20isolated%20on%20white%20background%20no%20human%20no%20hands]. Wajib gunakan awalan [GAMBAR: dan akhiran ]].`;
        const messages = [
            { role: 'system', content: enhancedPrompt },
            ...history.map((h) => ({
                role: h.role === 'user' ? 'user' : 'assistant',
                content: h.content,
            })),
            { role: 'user', content: prompt },
        ];
        const response = await axios_1.default.post(url, {
            model: 'google/gemini-2.0-flash-lite-preview-02-05:free',
            messages,
            temperature,
        }, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'WhatsBiz AI Agent',
            },
            timeout: 10000,
        });
        const text = response.data?.choices?.[0]?.message?.content;
        if (!text)
            throw new Error('Format respon OpenRouter tidak valid');
        return text;
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map