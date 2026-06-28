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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappClientService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappClientService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const chat_gateway_1 = require("../messages/chat.gateway");
const ai_service_1 = require("../ai/ai.service");
const baileys_1 = require("@whiskeysockets/baileys");
const path = require("path");
const fs = require("fs");
const QRCode = require("qrcode");
const pino_1 = require("pino");
let WhatsappClientService = WhatsappClientService_1 = class WhatsappClientService {
    constructor(prisma, chatGateway, aiService) {
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.aiService = aiService;
        this.logger = new common_1.Logger(WhatsappClientService_1.name);
        this.socks = new Map();
        this.statuses = new Map();
        this.qrCodeUrls = new Map();
        this.connectedNumbers = new Map();
        this.pairingCodes = new Map();
    }
    async onModuleInit() {
        this.logger.log('Menginisialisasi WhatsApp Baileys Client untuk seluruh tenant...');
        try {
            const tenants = await this.prisma.tenant.findMany({
                where: { is_active: true }
            });
            this.logger.log(`Ditemukan ${tenants.length} tenant aktif.`);
            for (const tenant of tenants) {
                this.logger.log(`Memulai WhatsApp Client untuk Tenant: ${tenant.name} (${tenant.id})`);
                this.startWhatsapp(tenant.id).catch((err) => {
                    this.logger.error(`Gagal memulai WhatsApp Client untuk Tenant ${tenant.name}:`, err);
                });
            }
        }
        catch (err) {
            this.logger.error('Gagal memuat tenant saat inisialisasi WhatsApp:', err);
        }
    }
    getStatus(tenantId = 'default') {
        return {
            status: this.statuses.get(tenantId) || 'DISCONNECTED',
            qr: this.qrCodeUrls.get(tenantId) || null,
            number: this.connectedNumbers.get(tenantId) || null,
            pairingCode: this.pairingCodes.get(tenantId) || null,
        };
    }
    getSessionPath(tenantId) {
        return path.join(process.cwd(), 'sessions', `whatsapp-session-${tenantId}`);
    }
    async startWhatsapp(tenantId = 'default') {
        this.statuses.set(tenantId, 'CONNECTING');
        this.broadcastStatus(tenantId);
        const sessionDir = this.getSessionPath(tenantId);
        const sessionsRoot = path.join(process.cwd(), 'sessions');
        if (!fs.existsSync(sessionsRoot)) {
            fs.mkdirSync(sessionsRoot, { recursive: true });
        }
        if (!fs.existsSync(sessionDir)) {
            fs.mkdirSync(sessionDir, { recursive: true });
        }
        const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(sessionDir);
        const sock = (0, baileys_1.default)({
            auth: state,
            printQRInTerminal: false,
            logger: (0, pino_1.default)({ level: 'silent' }),
            browser: ['Windows', 'Chrome', '110.0.0.0'],
        });
        this.socks.set(tenantId, sock);
        sock.ev.on('creds.update', async () => {
            try {
                if (!fs.existsSync(sessionDir)) {
                    fs.mkdirSync(sessionDir, { recursive: true });
                }
                await saveCreds();
            }
            catch (err) {
                this.logger.error(`[Tenant ${tenantId}] Gagal menyimpan credentials (creds.update):`, err);
            }
        });
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            if (qr) {
                this.statuses.set(tenantId, 'QR_READY');
                try {
                    const qrCodeUrl = await QRCode.toDataURL(qr);
                    this.qrCodeUrls.set(tenantId, qrCodeUrl);
                    this.broadcastStatus(tenantId);
                }
                catch (err) {
                    this.logger.error(`[Tenant ${tenantId}] Gagal membuat QR Code image:`, err);
                }
            }
            if (connection === 'close') {
                this.qrCodeUrls.set(tenantId, null);
                this.connectedNumbers.set(tenantId, null);
                this.pairingCodes.set(tenantId, null);
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut &&
                    statusCode !== baileys_1.DisconnectReason.connectionReplaced;
                this.logger.warn(`[Tenant ${tenantId}] Koneksi terputus. Alasan: ${lastDisconnect?.error?.message || 'Unknown'}. Status Code: ${statusCode}. Reconnect: ${shouldReconnect}`);
                if (shouldReconnect) {
                    this.statuses.set(tenantId, 'CONNECTING');
                    this.broadcastStatus(tenantId);
                    setTimeout(() => this.startWhatsapp(tenantId), 5000);
                }
                else {
                    this.statuses.set(tenantId, 'DISCONNECTED');
                    this.broadcastStatus(tenantId);
                    if (statusCode === baileys_1.DisconnectReason.loggedOut) {
                        this.clearSessionFolder(tenantId);
                        this.logger.log(`[Tenant ${tenantId}] Sesi keluar (Logged Out) oleh WhatsApp HP. Folder sesi dibersihkan.`);
                    }
                    else {
                        this.logger.log(`[Tenant ${tenantId}] Koneksi ditutup (Status: ${statusCode}). Sesi tetap disimpan.`);
                    }
                    this.socks.delete(tenantId);
                }
            }
            else if (connection === 'open') {
                this.statuses.set(tenantId, 'CONNECTED');
                this.qrCodeUrls.set(tenantId, null);
                this.pairingCodes.set(tenantId, null);
                const rawUser = sock.user?.id || '';
                const connectedNumber = rawUser.split(':')[0];
                this.connectedNumbers.set(tenantId, connectedNumber);
                this.logger.log(`[Tenant ${tenantId}] WhatsApp terhubung dengan nomor: ${connectedNumber}`);
                this.broadcastStatus(tenantId);
            }
        });
        sock.ev.on('messages.upsert', async (m) => {
            const msg = m.messages[0];
            if (!msg.message ||
                msg.key.fromMe ||
                msg.key.remoteJid.includes('@g.us') ||
                msg.key.remoteJid === 'status@broadcast') {
                return;
            }
            const remoteJid = msg.key.remoteJid;
            const text = msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                '';
            if (!text.trim())
                return;
            const phone = remoteJid.split('@')[0];
            this.logger.log(`[Tenant ${tenantId}] Menerima pesan dari ${phone}: "${text}"`);
            try {
                await this.handleIncomingMessage(tenantId, phone, text, msg);
            }
            catch (err) {
                this.logger.error(`[Tenant ${tenantId}] Error memproses pesan masuk:`, err);
            }
        });
        sock.ev.on('contacts.upsert', async (contacts) => {
            this.logger.log(`[Tenant ${tenantId}] Sinkronisasi ${contacts.length} kontak...`);
            for (const contact of contacts) {
                if (!contact.id.endsWith('@s.whatsapp.net'))
                    continue;
                const phone = contact.id.split('@')[0];
                const name = contact.name || contact.notify || `WhatsApp User ${phone}`;
                const existing = await this.prisma.customer.findFirst({
                    where: { tenant_id: tenantId, phone: { contains: phone } }
                });
                if (!existing) {
                    await this.prisma.customer.create({
                        data: {
                            tenant_id: tenantId,
                            name: name,
                            phone: phone,
                            status: 'LEAD',
                        }
                    });
                }
            }
        });
        sock.ev.on('messaging-history.set', async ({ chats, contacts, messages, isLatest }) => {
            this.logger.log(`[Tenant ${tenantId}] Sinkronisasi Riwayat: ${chats.length} chat, ${contacts.length} kontak, ${messages.length} pesan.`);
            for (const contact of contacts) {
                if (!contact.id.endsWith('@s.whatsapp.net'))
                    continue;
                const phone = contact.id.split('@')[0];
                const name = contact.name || contact.notify || `WhatsApp User ${phone}`;
                const existing = await this.prisma.customer.findFirst({
                    where: { tenant_id: tenantId, phone: { contains: phone } }
                });
                if (!existing) {
                    await this.prisma.customer.create({
                        data: { tenant_id: tenantId, name, phone, status: 'LEAD' }
                    });
                }
            }
            for (const msg of messages) {
                if (!msg.message || msg.key.remoteJid?.includes('@g.us') || msg.key.remoteJid === 'status@broadcast')
                    continue;
                const phone = msg.key.remoteJid?.split('@')[0];
                if (!phone)
                    continue;
                const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
                if (!text)
                    continue;
                let customer = await this.prisma.customer.findFirst({
                    where: { tenant_id: tenantId, phone: { contains: phone } }
                });
                if (!customer) {
                    customer = await this.prisma.customer.create({
                        data: { tenant_id: tenantId, name: `WhatsApp User ${phone}`, phone, status: 'LEAD' }
                    });
                }
                const conversation = await this.getOrCreateConversation(tenantId, customer.id);
                const existingMsg = await this.prisma.message.findFirst({
                    where: { tenant_id: tenantId, content: text, created_at: new Date(msg.messageTimestamp * 1000) }
                });
                if (!existingMsg) {
                    await this.prisma.message.create({
                        data: {
                            tenant_id: tenantId,
                            conversation_id: conversation.id,
                            sender_id: msg.key.fromMe ? 'OWNER' : null,
                            type: 'TEXT',
                            content: text,
                            status: msg.key.fromMe ? 'sent' : 'delivered',
                            created_at: new Date(msg.messageTimestamp * 1000)
                        }
                    });
                }
            }
            this.logger.log(`[Tenant ${tenantId}] Sinkronisasi Riwayat Selesai.`);
        });
    }
    broadcastStatus(tenantId) {
        const statusData = this.getStatus(tenantId);
        if (this.chatGateway?.server) {
            this.chatGateway.server.to(`tenant:${tenantId}`).emit('whatsapp:status_update', statusData);
        }
    }
    async handleIncomingMessage(tenantId, phone, text, rawMsg) {
        let customer = await this.prisma.customer.findFirst({
            where: { tenant_id: tenantId, phone: { contains: phone }, deleted_at: null },
        });
        if (!customer) {
            customer = await this.prisma.customer.create({
                data: {
                    tenant_id: tenantId,
                    name: `WhatsApp User ${phone}`,
                    phone: phone,
                    status: 'LEAD',
                },
            });
            this.logger.log(`[Tenant ${tenantId}] Membuat customer baru untuk ${phone}`);
        }
        const conversation = await this.getOrCreateConversation(tenantId, customer.id);
        const savedMessage = await this.prisma.message.create({
            data: {
                tenant_id: tenantId,
                conversation_id: conversation.id,
                sender_id: null,
                type: 'TEXT',
                content: text,
                status: 'delivered',
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                last_message: text,
                unread_count: { increment: 1 },
                updated_at: new Date(),
            },
        });
        this.emitNewMessage(tenantId, conversation.id, savedMessage);
        const aiConfig = await this.aiService.getAgentConfig(tenantId);
        if (!aiConfig || !aiConfig.is_active) {
            this.logger.log(`[Tenant ${tenantId}] AI Agent tidak aktif. Melewati balasan otomatis.`);
            return;
        }
        const recentMessages = await this.prisma.message.findMany({
            where: { conversation_id: conversation.id, tenant_id: tenantId },
            orderBy: { created_at: 'desc' },
            take: 10,
        });
        recentMessages.reverse();
        const history = recentMessages.map((m) => ({
            role: m.sender_id === null ? 'user' : 'model',
            content: m.content,
        }));
        if (history.length > 0) {
            history.pop();
        }
        this.logger.log(`[Tenant ${tenantId}] Meminta jawaban AI untuk customer ${phone}...`);
        const rawAiReply = await this.aiService.generateResponse(tenantId, text, history);
        const imageRegex = /\[GAMBAR:\s*(https?:\/\/[^\]]+)\]/i;
        const match = rawAiReply.match(imageRegex);
        let aiReply = rawAiReply;
        let imageUrl = null;
        if (match && match[1]) {
            imageUrl = match[1];
            aiReply = rawAiReply.replace(match[0], '').trim();
        }
        const jid = rawMsg.key.remoteJid;
        const sock = this.socks.get(tenantId);
        if (sock) {
            try {
                await sock.readMessages([rawMsg.key]);
                await sock.sendPresenceUpdate('composing', jid);
                const baseDelay = Math.min(Math.max(aiReply.length * 40, 3000), 6000);
                const randomDelay = baseDelay + Math.floor(Math.random() * 2000);
                this.logger.log(`[Tenant ${tenantId}] Menunggu batas aman ${randomDelay}ms (simulasi mengetik...) sebelum membalas ${phone}`);
                await new Promise((resolve) => setTimeout(resolve, randomDelay));
                await sock.sendPresenceUpdate('paused', jid);
                if (imageUrl) {
                    try {
                        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: aiReply });
                        this.logger.log(`[Tenant ${tenantId}] AI membalas ke ${phone} dengan lampiran foto.`);
                    }
                    catch (imgErr) {
                        this.logger.error(`[Tenant ${tenantId}] Gagal mengirim lampiran foto, fallback ke link teks:`, imgErr);
                        await sock.sendMessage(jid, { text: aiReply + `\n\n(Link Foto Produk: ${imageUrl})` });
                    }
                }
                else {
                    await sock.sendMessage(jid, { text: aiReply });
                    this.logger.log(`[Tenant ${tenantId}] AI membalas ke ${phone}: "${aiReply}"`);
                }
            }
            catch (sendErr) {
                this.logger.error(`[Tenant ${tenantId}] Gagal memproses simulasi mengetik, langsung mengirim:`, sendErr);
                if (imageUrl) {
                    try {
                        await sock.sendMessage(jid, { image: { url: imageUrl }, caption: aiReply });
                    }
                    catch (imgErr2) {
                        await sock.sendMessage(jid, { text: aiReply + `\n\n(Link Foto Produk: ${imageUrl})` });
                    }
                }
                else {
                    await sock.sendMessage(jid, { text: aiReply });
                }
            }
        }
        else {
            this.logger.error(`[Tenant ${tenantId}] Gagal mengirim balasan AI: Socket tidak aktif.`);
            return;
        }
        const finalStoredMessage = imageUrl ? `[Mengirim Foto Produk]\n${aiReply}` : aiReply;
        const savedAiMessage = await this.prisma.message.create({
            data: {
                tenant_id: tenantId,
                conversation_id: conversation.id,
                sender_id: 'AI_BOT',
                type: imageUrl ? 'IMAGE' : 'TEXT',
                content: finalStoredMessage,
                status: 'sent',
            },
        });
        await this.prisma.conversation.update({
            where: { id: conversation.id },
            data: {
                last_message: aiReply,
                updated_at: new Date(),
            },
        });
        this.emitNewMessage(tenantId, conversation.id, savedAiMessage);
    }
    async getOrCreateConversation(tenantId, customerId) {
        const existing = await this.prisma.conversation.findFirst({
            where: { tenant_id: tenantId, customer_id: customerId },
        });
        if (existing)
            return existing;
        return this.prisma.conversation.create({
            data: {
                tenant_id: tenantId,
                customer_id: customerId,
                status: 'OPEN',
            },
        });
    }
    emitNewMessage(tenantId, conversationId, message) {
        if (this.chatGateway?.server) {
            this.chatGateway.server.to(`tenant:${tenantId}`).emit('message:new', {
                message,
                conversationId,
            });
        }
    }
    async connectWithPairingCode(tenantId = 'default', phoneNumber) {
        const currentStatus = this.statuses.get(tenantId) || 'DISCONNECTED';
        if (currentStatus === 'CONNECTED') {
            throw new Error('WhatsApp sudah terhubung.');
        }
        let cleanedPhone = phoneNumber.replace(/\D/g, '');
        if (!cleanedPhone)
            throw new Error('Format nomor HP tidak valid');
        if (cleanedPhone.startsWith('0')) {
            cleanedPhone = '62' + cleanedPhone.slice(1);
        }
        const currentSock = this.socks.get(tenantId);
        try {
            if (currentSock) {
                currentSock.end(undefined);
            }
        }
        catch { }
        this.socks.delete(tenantId);
        this.pairingCodes.set(tenantId, null);
        this.qrCodeUrls.set(tenantId, null);
        this.logger.log(`[Tenant ${tenantId}] Memulai socket baru untuk meminta pairing code nomor: ${cleanedPhone}`);
        await this.startWhatsapp(tenantId);
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const sock = this.socks.get(tenantId);
        if (!sock) {
            throw new Error('Gagal menginisialisasi WhatsApp socket.');
        }
        this.logger.log(`[Tenant ${tenantId}] Meminta pairing code untuk nomor: ${cleanedPhone}`);
        try {
            const code = await sock.requestPairingCode(cleanedPhone);
            this.pairingCodes.set(tenantId, code);
            this.broadcastStatus(tenantId);
            return code;
        }
        catch (err) {
            this.logger.error(`[Tenant ${tenantId}] Gagal mendapatkan pairing code:`, err);
            throw new Error(`Gagal mendapatkan pairing code: ${err.message}`);
        }
    }
    async logout(tenantId = 'default') {
        this.logger.log(`[Tenant ${tenantId}] Memutuskan koneksi WhatsApp & menghapus sesi...`);
        const sock = this.socks.get(tenantId);
        try {
            if (sock) {
                await sock.logout();
            }
        }
        catch (err) {
        }
        this.clearSessionFolder(tenantId);
        this.statuses.set(tenantId, 'DISCONNECTED');
        this.qrCodeUrls.set(tenantId, null);
        this.connectedNumbers.set(tenantId, null);
        this.pairingCodes.set(tenantId, null);
        this.socks.delete(tenantId);
        this.broadcastStatus(tenantId);
        this.startWhatsapp(tenantId).catch((err) => {
            this.logger.error(`[Tenant ${tenantId}] Gagal restart whatsapp setelah logout:`, err);
        });
    }
    clearSessionFolder(tenantId) {
        const sessionDir = this.getSessionPath(tenantId);
        try {
            if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
                this.logger.log(`[Tenant ${tenantId}] Sesi folder terhapus bersih.`);
            }
        }
        catch (err) {
            this.logger.error(`[Tenant ${tenantId}] Gagal menghapus sesi folder:`, err);
        }
    }
};
exports.WhatsappClientService = WhatsappClientService;
exports.WhatsappClientService = WhatsappClientService = WhatsappClientService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => ai_service_1.AiService))),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        ai_service_1.AiService])
], WhatsappClientService);
function remoteJidFromPhone(phone) {
    return `${phone.replace(/\D/g, '')}@s.whatsapp.net`;
}
//# sourceMappingURL=whatsapp-client.service.js.map