import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import {
  CreateInvoiceDto,
  RecordPaymentDto,
  UpdateInvoiceStatusDto,
} from './dto/invoice.dto';

@Controller('invoices')
@UseGuards(AuthGuard('jwt'))
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    return this.invoicesService.getInvoiceStats(req.user.tenantId);
  }

  @Get()
  getInvoices(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.invoicesService.getInvoices(
      req.user.tenantId,
      parseInt(page, 10),
      parseInt(limit, 10),
      status,
      search,
    );
  }

  @Get(':id')
  getInvoice(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.getInvoiceById(req.user.tenantId, id);
  }

  @Post()
  createInvoice(@Request() req: any, @Body() dto: CreateInvoiceDto) {
    return this.invoicesService.createInvoice(req.user.tenantId, dto);
  }

  @Post(':id/payments')
  recordPayment(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: RecordPaymentDto,
  ) {
    return this.invoicesService.recordPayment(req.user.tenantId, id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateInvoiceStatusDto,
  ) {
    return this.invoicesService.updateStatus(req.user.tenantId, id, dto);
  }

  /** GET /invoices/:id/whatsapp — returns pre-formatted WA message text */
  @Get(':id/whatsapp')
  async getWhatsappMessage(@Request() req: any, @Param('id') id: string) {
    const invoice = await this.invoicesService.getInvoiceById(req.user.tenantId, id);
    const message = this.invoicesService.getWhatsappMessage(invoice);
    const phone = invoice.order?.customer?.phone?.replace(/\D/g, '');
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    return { message, waUrl, phone };
  }

  /** GET /invoices/:id/export — returns full invoice data for PDF generation */
  @Get(':id/export')
  exportInvoice(@Request() req: any, @Param('id') id: string) {
    return this.invoicesService.getInvoiceForExport(req.user.tenantId, id);
  }
}
