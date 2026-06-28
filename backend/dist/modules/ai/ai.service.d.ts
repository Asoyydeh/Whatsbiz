import { PrismaService } from '../../database/prisma.service';
export declare class AiService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getAgentConfig(tenantId: string): Promise<{
        id: string;
        tenant_id: string;
        is_active: boolean;
        system_prompt: string;
        catalog_data: string | null;
        gemini_api_key: string | null;
        groq_api_key: string | null;
        cohere_api_key: string | null;
        openrouter_key: string | null;
        primary_provider: string;
        temperature: number;
        created_at: Date;
        updated_at: Date;
    }>;
    updateAgentConfig(tenantId: string, data: any): Promise<{
        id: string;
        tenant_id: string;
        is_active: boolean;
        system_prompt: string;
        catalog_data: string | null;
        gemini_api_key: string | null;
        groq_api_key: string | null;
        cohere_api_key: string | null;
        openrouter_key: string | null;
        primary_provider: string;
        temperature: number;
        created_at: Date;
        updated_at: Date;
    }>;
    getRouterLogs(tenantId: string, limit?: number): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        provider: string;
        fallback_used: boolean;
        status: string;
        latency_ms: number;
        error_message: string | null;
    }[]>;
    getStats(tenantId: string): Promise<{
        total: number;
        success: number;
        fallbackCount: number;
        failed: number;
        avgLatency: number;
        providerStats: any;
    }>;
    generateResponse(tenantId: string, prompt: string, history: {
        role: 'user' | 'model';
        content: string;
    }[]): Promise<string>;
    private getApiKeyForProvider;
    private callGemini;
    private callGroq;
    private callCohere;
    private callOpenRouter;
}
