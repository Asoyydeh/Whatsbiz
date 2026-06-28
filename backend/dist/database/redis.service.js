"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
let RedisService = class RedisService {
    constructor() {
        this.store = new Map();
        this.userSets = new Map();
    }
    onModuleInit() {
        console.log('[WhatsBiz Mock Redis] In-Memory Redis Mock Initialized (No Redis server needed!)');
    }
    onModuleDestroy() {
        this.store.clear();
        this.userSets.clear();
    }
    async set(key, value, ttlSeconds) {
        const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
        this.store.set(key, { value, expiresAt });
    }
    async get(key) {
        const data = this.store.get(key);
        if (!data)
            return null;
        if (data.expiresAt && Date.now() > data.expiresAt) {
            this.store.delete(key);
            return null;
        }
        return data.value;
    }
    async del(...keys) {
        let deletedCount = 0;
        for (const key of keys) {
            if (this.store.has(key)) {
                this.store.delete(key);
                deletedCount++;
            }
        }
        return deletedCount;
    }
    getSessionKey(userId, tokenId) {
        return `session:${userId}:${tokenId}`;
    }
    getUserTokenSetKey(userId) {
        return `user_tokens:${userId}`;
    }
    async saveSession(userId, tokenId, metadata, ttlSeconds) {
        const key = this.getSessionKey(userId, tokenId);
        const setKey = this.getUserTokenSetKey(userId);
        await this.set(key, JSON.stringify(metadata), ttlSeconds);
        if (!this.userSets.has(setKey)) {
            this.userSets.set(setKey, new Set());
        }
        this.userSets.get(setKey).add(tokenId);
    }
    async isSessionActive(userId, tokenId) {
        const key = this.getSessionKey(userId, tokenId);
        const data = await this.get(key);
        return !!data;
    }
    async invalidateSession(userId, tokenId) {
        const key = this.getSessionKey(userId, tokenId);
        const setKey = this.getUserTokenSetKey(userId);
        await this.del(key);
        if (this.userSets.has(setKey)) {
            this.userSets.get(setKey).delete(tokenId);
        }
    }
    async invalidateAllUserSessions(userId) {
        const setKey = this.getUserTokenSetKey(userId);
        const activeTokenIds = this.userSets.get(setKey);
        if (activeTokenIds && activeTokenIds.size > 0) {
            const keys = Array.from(activeTokenIds).map((id) => this.getSessionKey(userId, id));
            await this.del(...keys);
        }
        this.userSets.delete(setKey);
    }
    getUsedTokenKey(tokenId) {
        return `used_token:${tokenId}`;
    }
    async markTokenAsUsed(tokenId, ttlSeconds) {
        const key = this.getUsedTokenKey(tokenId);
        await this.set(key, 'used', ttlSeconds);
    }
    async isTokenUsed(tokenId) {
        const key = this.getUsedTokenKey(tokenId);
        const data = await this.get(key);
        return !!data;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = __decorate([
    (0, common_1.Injectable)()
], RedisService);
//# sourceMappingURL=redis.service.js.map