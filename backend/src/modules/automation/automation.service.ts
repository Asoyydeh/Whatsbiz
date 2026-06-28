import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateAutomationDto,
  UpdateAutomationDto,
  ToggleAutomationDto,
} from './dto/automation.dto';

@Injectable()
export class AutomationService {
  constructor(private readonly prisma: PrismaService) {}

  async getAutomations(tenantId: string) {
    // Store automation with flow as JSON in the trigger field (repurposing existing schema)
    // In production you would add proper columns via migration
    const rows = await this.prisma.automation.findMany({
      where: { tenant_id: tenantId },
      orderBy: { created_at: 'desc' },
    });

    return rows.map((r) => {
      let parsed: any = {};
      try {
        parsed = JSON.parse(r.trigger);
      } catch {
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

  async getAutomationById(tenantId: string, id: string) {
    const row = await this.prisma.automation.findFirst({
      where: { id, tenant_id: tenantId },
    });
    if (!row) throw new NotFoundException('Automation tidak ditemukan.');
    let parsed: any = {};
    try {
      parsed = JSON.parse(row.trigger);
    } catch {
      parsed = { trigger: row.trigger };
    }
    return { id: row.id, name: row.name, is_active: row.is_active, created_at: row.created_at, ...parsed };
  }

  async createAutomation(tenantId: string, dto: CreateAutomationDto) {
    // Serialize the full flow config as JSON into the `trigger` field
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

  async updateAutomation(tenantId: string, id: string, dto: UpdateAutomationDto) {
    const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
    if (!row) throw new NotFoundException('Automation tidak ditemukan.');

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

  async toggleAutomation(tenantId: string, id: string, dto: ToggleAutomationDto) {
    const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
    if (!row) throw new NotFoundException('Automation tidak ditemukan.');

    return this.prisma.automation.update({
      where: { id },
      data: { is_active: dto.is_active },
    });
  }

  async deleteAutomation(tenantId: string, id: string) {
    const row = await this.prisma.automation.findFirst({ where: { id, tenant_id: tenantId } });
    if (!row) throw new NotFoundException('Automation tidak ditemukan.');
    await this.prisma.automation.delete({ where: { id } });
    return { message: 'Automation berhasil dihapus.' };
  }

  async getStats(tenantId: string) {
    const [total, active] = await Promise.all([
      this.prisma.automation.count({ where: { tenant_id: tenantId } }),
      this.prisma.automation.count({ where: { tenant_id: tenantId, is_active: true } }),
    ]);
    return { total, active, inactive: total - active };
  }
}
