import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService
  ) {}

  // 1. REGISTER COMPANY (Tenant + Owner Account in one Prisma Transaction)
  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Alamat email sudah terdaftar. Silakan gunakan email lain.');
    }

    const hashedPassword = await argon2.hash(dto.password);
    
    // Convert company name into a subdomain-friendly domain (e.g. "Toko Maju" -> "toko-maju")
    const resolvedDomain = dto.company_name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    // Execute database transaction
    return this.prisma.$transaction(async (tx) => {
      // Create Tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.company_name,
          domain: resolvedDomain,
          plan: 'FREE',
          is_active: true,
        },
      });

      // Create Owner User
      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          name: dto.name,
          email: dto.email,
          password: hashedPassword,
          role: UserRole.OWNER,
          is_active: true,
        },
      });

      // Create default subscription record
      await tx.subscription.create({
        data: {
          tenant_id: tenant.id,
          plan: 'FREE',
          status: 'active',
          start_date: new Date(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days expiration
        },
      });

      // Log registration audit log
      await tx.auditLog.create({
        data: {
          tenant_id: tenant.id,
          user_id: user.id,
          action: 'REGISTER',
          resource: 'Tenant',
          metadata: { company_name: dto.company_name, email: dto.email },
        },
      });

      return {
        message: 'Registrasi perusahaan dan owner berhasil dilakukan.',
        tenant: { id: tenant.id, name: tenant.name, domain: tenant.domain },
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      };
    });
  }

  // 2. LOGIN (Validate password, create session in Redis, return access & refresh tokens)
  async login(dto: LoginDto, ip: string, userAgent: string) {
    const user = await this.prisma.user.findFirst({
      where: { email: dto.email },
      include: { tenant: true },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    if (!user.is_active || !user.tenant.is_active) {
      throw new UnauthorizedException('Akun atau tenant Anda dinonaktifkan. Silakan hubungi admin.');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    // Generate credentials
    const tokens = await this.generateTokens(user.id, user.tenant_id, user.role, ip, userAgent);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: user.tenant_id,
        user_id: user.id,
        action: 'LOGIN',
        resource: 'User',
        ip_address: ip,
        metadata: { user_agent: userAgent },
      },
    });

    return tokens;
  }

  // 3. REFRESH TOKEN ROTATION WITH REUSE DETECTION
  async refresh(refreshToken: string, ip: string, userAgent: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkeythatisverylongandsecure123!',
      });

      const userId = payload.sub;
      const tokenId = payload.jti;
      const tenantId = payload.tenantId;
      const role = payload.role;

      // Detect token reuse
      const isUsed = await this.redisService.isTokenUsed(tokenId);
      if (isUsed) {
        // TOKEN REUSE DETECTED: Revoke all active sessions for this user immediately!
        await this.redisService.invalidateAllUserSessions(userId);
        
        // Log critical security audit log
        await this.prisma.auditLog.create({
          data: {
            tenant_id: tenantId,
            user_id: userId,
            action: 'SESSION_REVOCATION_ALERT',
            resource: 'Auth',
            ip_address: ip,
            metadata: {
              reason: 'Refresh token reuse detected. Revoking all user sessions.',
              user_agent: userAgent,
              tokenId,
            },
          },
        });

        throw new UnauthorizedException('Deteksi penyalahgunaan token. Semua sesi dicabut demi alasan keamanan.');
      }

      // Verify session is actually active
      const isSessionActive = await this.redisService.isSessionActive(userId, tokenId);
      if (!isSessionActive) {
        throw new UnauthorizedException('Sesi tidak aktif atau kedaluwarsa.');
      }

      // Mark the old token ID as used in Redis to prevent reuse
      const refreshExpirySec = 7 * 24 * 60 * 60; // 7 Days
      await this.redisService.markTokenAsUsed(tokenId, refreshExpirySec);

      // Invalidate the old session
      await this.redisService.invalidateSession(userId, tokenId);

      // Generate a brand new pair of tokens
      return this.generateTokens(userId, tenantId, role, ip, userAgent);
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      throw new UnauthorizedException('Refresh token tidak valid atau telah kedaluwarsa.');
    }
  }

  // 4. LOGOUT (Invalidate session in Redis)
  async logout(userId: string, tokenId: string, tenantId: string, ip: string) {
    await this.redisService.invalidateSession(userId, tokenId);

    // Log logout audit log
    await this.prisma.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: userId,
        action: 'LOGOUT',
        resource: 'User',
        ip_address: ip,
      },
    });

    return { message: 'Berhasil keluar dari sesi.' };
  }

  // Helper method to generate access/refresh token pair and save session
  private async generateTokens(
    userId: string,
    tenantId: string,
    role: string,
    ip: string,
    userAgent: string
  ) {
    const tokenId = uuidv4(); // Unique session ID

    const accessPayload = { sub: userId, tenantId, role, jti: tokenId };
    const refreshPayload = { sub: userId, tenantId, role, jti: tokenId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: process.env.JWT_SECRET || 'supersecretjwtkeythatisverylongandsecure123!',
        expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: process.env.JWT_REFRESH_SECRET || 'supersecretrefreshjwtkeythatisverylongandsecure123!',
        expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      }),
    ]);

    // Save session in Redis
    const ttlSeconds = 7 * 24 * 60 * 60; // 7 days (matches refresh token expiry)
    await this.redisService.saveSession(
      userId,
      tokenId,
      { ip, userAgent, loginAt: new Date().toISOString() },
      ttlSeconds
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
