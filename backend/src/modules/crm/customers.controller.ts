import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Request, Response } from 'express';

@ApiTags('CRM / Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions('customer.read')
  @ApiOperation({ summary: 'Mendapatkan daftar pelanggan terpaginasi & terfilter' })
  @ApiResponse({ status: 200, description: 'Daftar pelanggan berhasil diambil.' })
  findAll(@Req() req: Request, @Query() query: QueryCustomerDto) {
    return this.customersService.findAll(req.tenantId, query);
  }

  @Get('export')
  @RequirePermissions('customer.read')
  @ApiOperation({ summary: 'Mengekspor daftar pelanggan ke format file CSV' })
  @ApiResponse({ status: 200, description: 'File CSV berhasil dibuat.' })
  async exportCSV(
    @Req() req: Request,
    @Res() res: Response,
    @Query() query: QueryCustomerDto
  ) {
    const csv = await this.customersService.exportCSV(req.tenantId, query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    return res.status(200).send(csv);
  }

  @Post('import')
  @RequirePermissions('customer.write')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Mengimpor daftar pelanggan dari file CSV' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        csv_content: {
          type: 'string',
          description: 'Konten CSV langsung (opsional untuk testing)',
        }
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Proses impor berhasil dilakukan.' })
  async importCSV(
    @Req() req: Request,
    @Body() body: { csv_content?: string },
    @UploadedFile() file?: any
  ) {
    let csvContent = '';
    if (file) {
      csvContent = file.buffer.toString('utf-8');
    } else if (body && body.csv_content) {
      csvContent = body.csv_content;
    } else {
      throw new BadRequestException('Berkas CSV wajib diunggah atau kolom csv_content disertakan.');
    }
    
    const actor = req.user as any;
    return this.customersService.importCSV(req.tenantId, csvContent, actor.id);
  }

  @Get(':id')
  @RequirePermissions('customer.read')
  @ApiOperation({ summary: 'Mendapatkan detail profil satu pelanggan' })
  @ApiResponse({ status: 200, description: 'Detail pelanggan berhasil ditemukan.' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.customersService.findOne(req.tenantId, id);
  }

  @Post()
  @RequirePermissions('customer.write')
  @ApiOperation({ summary: 'Membuat profil pelanggan baru' })
  @ApiResponse({ status: 201, description: 'Profil pelanggan berhasil dibuat.' })
  create(@Req() req: Request, @Body() createCustomerDto: CreateCustomerDto) {
    const actor = req.user as any;
    return this.customersService.create(req.tenantId, createCustomerDto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('customer.write')
  @ApiOperation({ summary: 'Memperbarui profil pelanggan' })
  @ApiResponse({ status: 200, description: 'Profil pelanggan berhasil diperbarui.' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto
  ) {
    const actor = req.user as any;
    return this.customersService.update(req.tenantId, id, updateCustomerDto, actor.id);
  }

  @Delete(':id')
  @RequirePermissions('customer.write')
  @ApiOperation({ summary: 'Soft-delete (nonaktifkan) pelanggan' })
  @ApiResponse({ status: 200, description: 'Pelanggan berhasil dinonaktifkan.' })
  delete(@Req() req: Request, @Param('id') id: string) {
    const actor = req.user as any;
    return this.customersService.delete(req.tenantId, id, actor.id);
  }
}
