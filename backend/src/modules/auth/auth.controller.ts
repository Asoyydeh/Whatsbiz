import { Controller, Post, Body, Get, UseGuards, Req, Ip, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Daftar Tenant & Akun Owner baru' })
  @ApiResponse({ status: 201, description: 'Tenant & user owner berhasil dibuat.' })
  @ApiResponse({ status: 409, description: 'Email sudah terdaftar.' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Masuk ke aplikasi WhatsBiz CRM' })
  @ApiResponse({ status: 200, description: 'Autentikasi berhasil, mengembalikan token JWT.' })
  @ApiResponse({ status: 401, description: 'Email atau password salah.' })
  login(
    @Body() loginDto: LoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.authService.login(loginDto, ip, userAgent || 'Unknown');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotasi refresh token JWT' })
  @ApiResponse({ status: 200, description: 'Token rotasi berhasil.' })
  @ApiResponse({ status: 401, description: 'Refresh token tidak valid atau kedaluwarsa.' })
  refresh(
    @Body() refreshDto: RefreshDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string
  ) {
    return this.authService.refresh(refreshDto.refresh_token, ip, userAgent || 'Unknown');
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Keluar dan cabut sesi JWT aktif' })
  @ApiResponse({ status: 200, description: 'Berhasil keluar sesi.' })
  @ApiResponse({ status: 401, description: 'Sesi tidak valid.' })
  logout(@Req() req: Request, @Ip() ip: string) {
    const user = req.user as any;
    return this.authService.logout(user.id, user.tokenId, user.tenantId, ip);
  }

  @Get('session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mendapatkan informasi detail user sesi aktif' })
  @ApiResponse({ status: 200, description: 'Detail sesi aktif berhasil diambil.' })
  @ApiResponse({ status: 401, description: 'Sesi tidak aktif atau tidak valid.' })
  getSession(@Req() req: Request) {
    const user = req.user as any;
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenantId,
      },
    };
  }
}
