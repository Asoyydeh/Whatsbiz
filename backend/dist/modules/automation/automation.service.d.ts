import { PrismaService } from '../../database/prisma.service';
import { CreateAutomationDto, UpdateAutomationDto, ToggleAutomationDto } from './dto/automation.dto';
export declare class AutomationService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getAutomations(tenantId: string): Promise<any[]>;
    getAutomationById(tenantId: string, id: string): Promise<any>;
    createAutomation(tenantId: string, dto: CreateAutomationDto): Promise<any>;
    updateAutomation(tenantId: string, id: string, dto: UpdateAutomationDto): Promise<any>;
    toggleAutomation(tenantId: string, id: string, dto: ToggleAutomationDto): Promise<{
        name: string;
        id: string;
        tenant_id: string;
        is_active: boolean;
        created_at: Date;
        trigger: string;
    }>;
    deleteAutomation(tenantId: string, id: string): Promise<{
        message: string;
    }>;
    getStats(tenantId: string): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
}
