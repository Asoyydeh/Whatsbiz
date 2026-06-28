import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly redisService;
    private readonly jwtService;
    constructor(prisma: PrismaService, redisService: RedisService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        message: string;
        tenant: {
            id: string;
            name: string;
            domain: string;
        };
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(dto: LoginDto, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refresh(refreshToken: string, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(userId: string, tokenId: string, tenantId: string, ip: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
