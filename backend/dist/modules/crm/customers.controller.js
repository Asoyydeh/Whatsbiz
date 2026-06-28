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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const platform_express_1 = require("@nestjs/platform-express");
const customers_service_1 = require("./customers.service");
const create_customer_dto_1 = require("./dto/create-customer.dto");
const update_customer_dto_1 = require("./dto/update-customer.dto");
const query_customer_dto_1 = require("./dto/query-customer.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const tenant_guard_1 = require("../../common/guards/tenant.guard");
const permissions_guard_1 = require("../../common/guards/permissions.guard");
const permissions_decorator_1 = require("../../common/decorators/permissions.decorator");
let CustomersController = class CustomersController {
    constructor(customersService) {
        this.customersService = customersService;
    }
    findAll(req, query) {
        return this.customersService.findAll(req.tenantId, query);
    }
    async exportCSV(req, res, query) {
        const csv = await this.customersService.exportCSV(req.tenantId, query);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
        return res.status(200).send(csv);
    }
    async importCSV(req, body, file) {
        let csvContent = '';
        if (file) {
            csvContent = file.buffer.toString('utf-8');
        }
        else if (body && body.csv_content) {
            csvContent = body.csv_content;
        }
        else {
            throw new common_1.BadRequestException('Berkas CSV wajib diunggah atau kolom csv_content disertakan.');
        }
        const actor = req.user;
        return this.customersService.importCSV(req.tenantId, csvContent, actor.id);
    }
    findOne(req, id) {
        return this.customersService.findOne(req.tenantId, id);
    }
    create(req, createCustomerDto) {
        const actor = req.user;
        return this.customersService.create(req.tenantId, createCustomerDto, actor.id);
    }
    update(req, id, updateCustomerDto) {
        const actor = req.user;
        return this.customersService.update(req.tenantId, id, updateCustomerDto, actor.id);
    }
    delete(req, id) {
        const actor = req.user;
        return this.customersService.delete(req.tenantId, id, actor.id);
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.RequirePermissions)('customer.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan daftar pelanggan terpaginasi & terfilter' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Daftar pelanggan berhasil diambil.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, query_customer_dto_1.QueryCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export'),
    (0, permissions_decorator_1.RequirePermissions)('customer.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mengekspor daftar pelanggan ke format file CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'File CSV berhasil dibuat.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, query_customer_dto_1.QueryCustomerDto]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "exportCSV", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, permissions_decorator_1.RequirePermissions)('customer.write'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiOperation)({ summary: 'Mengimpor daftar pelanggan dari file CSV' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                csv_content: {
                    type: 'string',
                    description: 'Konten CSV langsung (opsional untuk testing)',
                }
            },
        },
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Proses impor berhasil dilakukan.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "importCSV", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('customer.read'),
    (0, swagger_1.ApiOperation)({ summary: 'Mendapatkan detail profil satu pelanggan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Detail pelanggan berhasil ditemukan.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.RequirePermissions)('customer.write'),
    (0, swagger_1.ApiOperation)({ summary: 'Membuat profil pelanggan baru' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Profil pelanggan berhasil dibuat.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_customer_dto_1.CreateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('customer.write'),
    (0, swagger_1.ApiOperation)({ summary: 'Memperbarui profil pelanggan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil pelanggan berhasil diperbarui.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_customer_dto_1.UpdateCustomerDto]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.RequirePermissions)('customer.write'),
    (0, swagger_1.ApiOperation)({ summary: 'Soft-delete (nonaktifkan) pelanggan' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Pelanggan berhasil dinonaktifkan.' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CustomersController.prototype, "delete", null);
exports.CustomersController = CustomersController = __decorate([
    (0, swagger_1.ApiTags)('CRM / Customers'),
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, tenant_guard_1.TenantGuard, permissions_guard_1.PermissionsGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [customers_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map