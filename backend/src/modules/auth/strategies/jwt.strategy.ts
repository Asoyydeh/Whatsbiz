import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RedisService } from '../../../database/redis.service';
import { PrismaService } from '../../../database/prisma.service';

interface JwtPayload {
  sub: string; // User ID
  tenantId: string;
  role: string;
  jti: string; // Token ID
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly redisService: RedisService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'supersecretjwtkeythatisverylongandsecure123!',
    });
  }

  async validate(payload: JwtPayload) {
    // 1. Verify if the session is active in Redis (using sub/userId and jti/tokenId)
    const isSessionActive = await this.redisService.isSessionActive(payload.sub, payload.jti);
    if (!isSessionActive) {
      throw new UnauthorizedException('Sesi telah berakhir atau tidak aktif. Silakan masuk kembali.');
    }

    // 2. Fetch user from DB to verify status
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, is_active: true, tenant_id: true },
    });

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Akun Anda dinonaktifkan atau tidak ditemukan.');
    }

    // 3. Return user context to request object
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenant_id,
      tokenId: payload.jti,
    };
  }
}
