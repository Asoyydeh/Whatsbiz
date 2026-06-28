import { AiService } from './ai.service';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    getConfig(req: any): Promise<{
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
    updateConfig(req: any, body: any): Promise<{
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
    getLogs(req: any): Promise<{
        id: string;
        tenant_id: string;
        created_at: Date;
        provider: string;
        fallback_used: boolean;
        status: string;
        latency_ms: number;
        error_message: string | null;
    }[]>;
    getStats(req: any): Promise<{
        total: number;
        success: number;
        fallbackCount: number;
        failed: number;
        avgLatency: number;
        providerStats: any;
    }>;
    testAgent(req: any, body: any): Promise<{
        response: string;
    }>;
}
