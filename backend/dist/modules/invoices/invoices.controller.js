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
exports.InvoicesController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const invoices_service_1 = require("./invoices.service");
const invoice_dto_1 = require("./dto/invoice.dto");
let InvoicesController = class InvoicesController {
    constructor(invoicesService) {
        this.invoicesService = invoicesService;
    }
    getStats(req) {
        return this.invoicesService.getInvoiceStats(req.user.tenantId);
    }
    getInvoices(req, page = '1', limit = '20', status, search) {
        return this.invoicesService.getInvoices(req.user.tenantId, parseInt(page, 10), parseInt(limit, 10), status, search);
    }
    getInvoice(req, id) {
        return this.invoicesService.getInvoiceById(req.user.tenantId, id);
    }
    createInvoice(req, dto) {
        return this.invoicesService.createInvoice(req.user.tenantId, dto);
    }
    recordPayment(req, id, dto) {
        return this.invoicesService.recordPayment(req.user.tenantId, id, dto);
    }
    updateStatus(req, id, dto) {
        return this.invoicesService.updateStatus(req.user.tenantId, id, dto);
    }
    async getWhatsappMessage(req, id) {
        const invoice = await this.invoicesService.getInvoiceById(req.user.tenantId, id);
        const message = this.invoicesService.getWhatsappMessage(invoice);
        const phone = invoice.order?.customer?.phone?.replace(/\D/g, '');
        const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        return { message, waUrl, phone };
    }
    exportInvoice(req, id) {
        return this.invoicesService.getInvoiceForExport(req.user.tenantId, id);
    }
};
exports.InvoicesController = InvoicesController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "getInvoice", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, invoice_dto_1.CreateInvoiceDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "createInvoice", null);
__decorate([
    (0, common_1.Post)(':id/payments'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, invoice_dto_1.RecordPaymentDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "recordPayment", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, invoice_dto_1.UpdateInvoiceStatusDto]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Get)(':id/whatsapp'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InvoicesController.prototype, "getWhatsappMessage", null);
__decorate([
    (0, common_1.Get)(':id/export'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], InvoicesController.prototype, "exportInvoice", null);
exports.InvoicesController = InvoicesController = __decorate([
    (0, common_1.Controller)('invoices'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [invoices_service_1.InvoicesService])
], InvoicesController);
//# sourceMappingURL=invoices.controller.js.map