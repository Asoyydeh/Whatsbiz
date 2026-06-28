import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { Request } from 'express';
import { UserRole } from '@prisma/client';

@ApiTags('Users & Team')
@Controller('users')
@UseGuards(JwtAuthGuard, TenantGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequirePermissions('team.manage')
  @ApiOperation({ summary: 'Mendapatkan daftar semua anggota tim' })
  @ApiResponse({ status: 200, description: 'Daftar tim berhasil diambil.' })
  findAll(@Req() req: Request) {
    return this.usersService.findAll(req.tenantId);
  }

  @Post()
  @RequirePermissions('team.manage')
  @ApiOperation({ summary: 'Menambahkan anggota tim baru' })
  @ApiResponse({ status: 201, description: 'Anggota tim berhasil ditambahkan.' })
  create(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    const actor = req.user as any;
    return this.usersService.create(req.tenantId, createUserDto, actor.id);
  }

  @Patch(':id')
  @RequirePermissions('team.manage')
  @ApiOperation({ summary: 'Mengubah profil / hak akses anggota tim' })
  @ApiResponse({ status: 200, description: 'Data anggota berhasil diperbarui.' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { name?: string; role?: UserRole; is_active?: boolean }
  ) {
    const actor = req.user as any;
    return this.usersService.update(req.tenantId, id, body, actor.id);
  }

  @Delete(':id')
  @RequirePermissions('team.manage')
  @ApiOperation({ summary: 'Menonaktifkan akses anggota tim (Disable)' })
  @ApiResponse({ status: 200, description: 'Anggota tim berhasil dinonaktifkan.' })
  disable(@Req() req: Request, @Param('id') id: string) {
    const actor = req.user as any;
    return this.usersService.disable(req.tenantId, id, actor.id);
  }
}
