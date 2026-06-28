import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Request } from 'express';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Mendapatkan profil perusahaan (Tenant)' })
  @ApiResponse({ status: 200, description: 'Detail profil berhasil diambil.' })
  getProfile(@Req() req: Request) {
    return this.tenantsService.getProfile(req.tenantId);
  }

  @Patch('profile')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('tenant.manage')
  @ApiOperation({ summary: 'Mengubah informasi profil perusahaan - Khusus Owner' })
  @ApiResponse({ status: 200, description: 'Profil berhasil diperbarui.' })
  updateProfile(@Req() req: Request, @Body() body: { name?: string; domain?: string }) {
    return this.tenantsService.updateProfile(req.tenantId, body);
  }
}
