import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private store;
    private userSets;
    onModuleInit(): void;
    onModuleDestroy(): void;
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    get(key: string): Promise<string | null>;
    del(...keys: string[]): Promise<number>;
    private getSessionKey;
    private getUserTokenSetKey;
    saveSession(userId: string, tokenId: string, metadata: {
        ip: string;
        userAgent: string;
        loginAt: string;
    }, ttlSeconds: number): Promise<void>;
    isSessionActive(userId: string, tokenId: string): Promise<boolean>;
    invalidateSession(userId: string, tokenId: string): Promise<void>;
    invalidateAllUserSessions(userId: string): Promise<void>;
    private getUsedTokenKey;
    markTokenAsUsed(tokenId: string, ttlSeconds: number): Promise<void>;
    isTokenUsed(tokenId: string): Promise<boolean>;
}
