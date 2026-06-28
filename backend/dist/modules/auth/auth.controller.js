"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const refresh_dto_1 = require("./dto/refresh.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register(registerDto) {
        return this.authService.register(registerDto);
    }
    login(loginDto, ip, userAgent) {
        return this.authService.login(loginDto, ip, userAgent || 'Unknown');
    }
    refresh(refreshDto, ip, userAgent) {
        return this.authService.refresh(refreshDto.refresh_token, ip, userAgent || 'Unknown');
    }
    logout(req, ip) {
        const user = req.user;
        return this.authService.logout(user.id, user.tokenId, user.tenantId, ip);
    }
    getSession(req) {
        const user = req.user;
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
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Daftar Tenant & Akun Owner baru' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Tenant & user owner berhasil dibuat.' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email sudah terdaftar.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Masuk ke aplikasi WhatsBiz CRM' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Autentikasi berhasil, mengembalikan token JWT.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Email atau password salah.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, String, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Rotasi refresh token JWT' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Token rotasi berhasil.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Refresh token tidak valid atau kedaluwarsa.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Ip)()),
    __param(2, (0, common_1.Headers)('user-agent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_dto_1.RefreshDto, String, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Keluar dan cabut sesi JWT aktif' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Berhasil keluar sesi.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Sesi tidak valid.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Ip)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('session'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan informasi detail user sesi aktif' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detail sesi aktif berhasil diambil.' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Sesi tidak aktif atau tidak valid.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getSession", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map