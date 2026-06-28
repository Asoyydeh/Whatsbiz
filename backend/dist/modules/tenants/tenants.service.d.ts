import { PrismaService } from '../../database/prisma.service';
export declare class TenantsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(tenantId: string): Promise<{
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
    updateProfile(tenantId: string, data: {
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
