import { TenantsService } from './tenants.service';
import { Request } from 'express';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getProfile(req: Request): Promise<{
        _count: {
            users: number;
            customers: number;
        };
    } & {
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        domain: string | null;
        plan: string;
    }>;
    updateProfile(req: Request, body: {
        name?: string;
        domain?: string;
    }): Promise<{
        name: string;
        id: string;
        is_active: boolean;
        created_at: Date;
        updated_at: Date;
        domain: string | null;
        plan: string;
    }>;
}
