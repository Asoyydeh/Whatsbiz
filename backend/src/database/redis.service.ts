import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  // In-Memory store to replace Redis for local standalone usage
  private store: Map<string, { value: string; expiresAt: number | null }> = new Map();
  private userSets: Map<string, Set<string>> = new Map();

  onModuleInit() {
    console.log('[WhatsBiz Mock Redis] In-Memory Redis Mock Initialized (No Redis server needed!)');
  }

  onModuleDestroy() {
    this.store.clear();
    this.userSets.clear();
  }

  // Basic Redis Wrapper Operations
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }

  async get(key: string): Promise<string | null> {
    const data = this.store.get(key);
    if (!data) return null;
    
    if (data.expiresAt && Date.now() > data.expiresAt) {
      this.store.delete(key);
      return null;
    }
    
    return data.value;
  }

  async del(...keys: string[]): Promise<number> {
    let deletedCount = 0;
    for (const key of keys) {
      if (this.store.has(key)) {
        this.store.delete(key);
        deletedCount++;
      }
    }
    return deletedCount;
  }

  // Session Helper Methods
  private getSessionKey(userId: string, tokenId: string): string {
    return `session:${userId}:${tokenId}`;
  }

  private getUserTokenSetKey(userId: string): string {
    return `user_tokens:${userId}`;
  }

  async saveSession(
    userId: string,
    tokenId: string,
    metadata: { ip: string; userAgent: string; loginAt: string },
    ttlSeconds: number
  ): Promise<void> {
    const key = this.getSessionKey(userId, tokenId);
    const setKey = this.getUserTokenSetKey(userId);
    
    // Store session info
    await this.set(key, JSON.stringify(metadata), ttlSeconds);
    
    // Add token ID to active set for this user
    if (!this.userSets.has(setKey)) {
      this.userSets.set(setKey, new Set());
    }
    this.userSets.get(setKey)!.add(tokenId);
  }

  async isSessionActive(userId: string, tokenId: string): Promise<boolean> {
    const key = this.getSessionKey(userId, tokenId);
    const data = await this.get(key);
    return !!data;
  }

  async invalidateSession(userId: string, tokenId: string): Promise<void> {
    const key = this.getSessionKey(userId, tokenId);
    const setKey = this.getUserTokenSetKey(userId);
    
    await this.del(key);
    if (this.userSets.has(setKey)) {
      this.userSets.get(setKey)!.delete(tokenId);
    }
  }

  async invalidateAllUserSessions(userId: string): Promise<void> {
    const setKey = this.getUserTokenSetKey(userId);
    const activeTokenIds = this.userSets.get(setKey);
    
    if (activeTokenIds && activeTokenIds.size > 0) {
      const keys = Array.from(activeTokenIds).map((id) => this.getSessionKey(userId, id));
      await this.del(...keys);
    }
    
    this.userSets.delete(setKey);
  }

  // Token Reuse Tracking (for refresh token rotation security)
  private getUsedTokenKey(tokenId: string): string {
    return `used_token:${tokenId}`;
  }

  async markTokenAsUsed(tokenId: string, ttlSeconds: number): Promise<void> {
    const key = this.getUsedTokenKey(tokenId);
    await this.set(key, 'used', ttlSeconds);
  }

  async isTokenUsed(tokenId: string): Promise<boolean> {
    const key = this.getUsedTokenKey(tokenId);
    const data = await this.get(key);
    return !!data;
  }
}
