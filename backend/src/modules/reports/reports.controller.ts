import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { ReportsService } from './reports.service';

interface TenantRequest {
  tenantId?: string;
}

@Controller('reports')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /** Summary cards: revenue, orders, customers, messages */
  @Get('summary')
  getSummary(@Req() req: TenantRequest) {
    return this.reportsService.getSummary(req.tenantId || '');
  }

  /** Revenue trend — daily for last N days */
  @Get('revenue-trend')
  getRevenueTrend(
    @Req() req: TenantRequest,
    @Query('days') days = '30',
  ) {
    return this.reportsService.getRevenueTrend(req.tenantId || '', parseInt(days, 10));
  }

  /** Order volume by status over time */
  @Get('order-stats')
  getOrderStats(@Req() req: TenantRequest) {
    return this.reportsService.getOrderStats(req.tenantId || '');
  }

  /** Customer growth — new customers per month */
  @Get('customer-growth')
  getCustomerStats(@Req() req: TenantRequest) {
    return this.reportsService.getCustomerStats(req.tenantId || '');
  }

  /** Top customers by lifetime value */
  @Get('top-customers')
  getTopCustomers(
    @Req() req: TenantRequest,
    @Query('limit') limit = '5',
  ) {
    return this.reportsService.getTopCustomers(req.tenantId || '', parseInt(limit, 10));
  }

  /** Invoice payment status breakdown */
  @Get('invoice-breakdown')
  getInvoiceStats(@Req() req: TenantRequest) {
    return this.reportsService.getInvoiceBreakdown(req.tenantId || '');
  }

  /** Message volume per day for last 14 days */
  @Get('message-stats')
  getMessageStats(@Req() req: TenantRequest) {
    return this.reportsService.getMessageStats(req.tenantId || '');
  }
}
