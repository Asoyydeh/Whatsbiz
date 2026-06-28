import { Strategy } from 'passport-jwt';
import { RedisService } from '../../../database/redis.service';
import { PrismaService } from '../../../database/prisma.service';
interface JwtPayload {
    sub: string;
    tenantId: string;
    role: string;
    jti: string;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly redisService;
    private readonly prisma;
    constructor(redisService: RedisService, prisma: PrismaService);
    validate(payload: JwtPayload): Promise<{
        id: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        tenantId: string;
        tokenId: string;
    }>;
}
export {};
