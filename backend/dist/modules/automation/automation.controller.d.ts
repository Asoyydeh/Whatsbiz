import { AutomationService } from './automation.service';
import { CreateAutomationDto, UpdateAutomationDto, ToggleAutomationDto } from './dto/automation.dto';
export declare class AutomationController {
    private readonly automationService;
    constructor(automationService: AutomationService);
    getStats(req: any): Promise<{
        total: number;
        active: number;
        inactive: number;
    }>;
    getAll(req: any): Promise<any[]>;
    getOne(req: any, id: string): Promise<any>;
    create(req: any, dto: CreateAutomationDto): Promise<any>;
    update(req: any, id: string, dto: UpdateAutomationDto): Promise<any>;
    toggle(req: any, id: string, dto: ToggleAutomationDto): Promise<{
        name: string;
        id: string;
        tenant_id: string;
        is_active: boolean;
        created_at: Date;
        trigger: string;
    }>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
