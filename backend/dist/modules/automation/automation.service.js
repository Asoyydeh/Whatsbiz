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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutomationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AutomationService = class AutomationService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAutomations(tenantId) {
        const rows = await this.prisma.automation.findMany({
            where: { tenant_id: tenantId },
            orderBy: { created_at: 'desc' },
        });
        return rows.map((r) => {
            let parsed = {};
            try {
                parsed = JSON.parse(r.trigger);
            }
            catch {
                parsed = { trigger: r.trigger };
            }
            return {
                id: r.id,
                name: r.name,
                is_active: r.is_active,
                created_at: r.created_at,
                ...parsed,
            };
        });
    }
    async getAutomationById(tenantId, id) {
        const row = await this.prisma.automation.findFirst({
            where: { id, tenant_id: tenantId },
        });
        if (!row)
            throw new common_1.NotFoundException('Automation tidak ditemukan.');
        let parsed = {};
        try {
            parsed = JSON.parse(row.trigger);
        }
        catch {
            parsed = { trigger: row.trigger };
        }
        return { id: row.id, name: row.name, is_active: row.is_active, created_at: row.created_at, ...parsed };
    }
    async createAutomation(tenantId, dto) {
        const payload = JSON.stringify({
            trigger: dto.trigger,
            trigger_config: dto.trigger_config || {},
            description: dto.description || '',
            conditions: dto.conditions || [],
            actions: dto.actions || [],
            flow_nodes: dto.flow_nodes || [],
            flow_edges: dto.flow_edges || [],
        });
        const row = await this.prisma.automation.create({
            data: {
                tenant_id: tenantId,
                name: dto.name,
                trigger: payload,
                is_active: false,
            },
        });
        return this.getAutomationById(tenantId, row.id);
    }
    async updateAutomation(tenantId, id, dto) {
        const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
        if (!row)
            throw new common_1.NotFoundException('Automation tidak ditemukan.');
        const payload = JSON.stringify({
            trigger: dto.trigger,
            trigger_config: dto.trigger_config || {},
            description: dto.description || '',
            conditions: dto.conditions || [],
            actions: dto.actions || [],
            flow_nodes: dto.flow_nodes || [],
            flow_edges: dto.flow_edges || [],
        });
        await this.prisma.automation.update({
            where: { id },
            data: { name: dto.name, trigger: payload },
        });
        return this.getAutomationById(tenantId, id);
    }
    async toggleAutomation(tenantId, id, dto) {
        const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
        if (!row)
            throw new common_1.NotFoundException('Automation tidak ditemukan.');
        return this.prisma.automation.update({
            where: { id },
            data: { is_active: dto.is_active },
        });
    }
    async deleteAutomation(tenantId, id) {
        const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
        if (!row)
            throw new common_1.NotFoundException('Automation tidak ditemukan.');
        await this.prisma.automation.delete({ where: { id } });
        return { message: 'Automation berhasil dihapus.' };
    }
    async getStats(tenantId) {
        const [total, active] = await Promise.all([
            this.prisma.automation.count({ where: { tenant_id: tenantId } }),
            this.prisma.automation.count({ where: { tenant_id: tenantId, is_active: true } }),
        ]);
        return { total, active, inactive: total - active };
    }
};
exports.AutomationService = AutomationService;
exports.AutomationService = AutomationService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutomationService);
//# sourceMappingURL=automation.service.js.map