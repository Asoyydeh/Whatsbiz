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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvoiceStatusDto = exports.RecordPaymentDto = exports.CreateInvoiceDto = exports.PaymentMethodEnum = exports.InvoiceStatusEnum = void 0;
const class_validator_1 = require("class-validator");
var InvoiceStatusEnum;
(function (InvoiceStatusEnum) {
    InvoiceStatusEnum["DRAFT"] = "DRAFT";
    InvoiceStatusEnum["SENT"] = "SENT";
    InvoiceStatusEnum["PARTIALLY_PAID"] = "PARTIALLY_PAID";
    InvoiceStatusEnum["PAID"] = "PAID";
    InvoiceStatusEnum["OVERDUE"] = "OVERDUE";
    InvoiceStatusEnum["CANCELLED"] = "CANCELLED";
})(InvoiceStatusEnum || (exports.InvoiceStatusEnum = InvoiceStatusEnum = {}));
var PaymentMethodEnum;
(function (PaymentMethodEnum) {
    PaymentMethodEnum["CASH"] = "CASH";
    PaymentMethodEnum["TRANSFER"] = "TRANSFER";
    PaymentMethodEnum["QRIS"] = "QRIS";
    PaymentMethodEnum["EWALLET"] = "EWALLET";
    PaymentMethodEnum["GATEWAY"] = "GATEWAY";
})(PaymentMethodEnum || (exports.PaymentMethodEnum = PaymentMethodEnum = {}));
class CreateInvoiceDto {
}
exports.CreateInvoiceDto = CreateInvoiceDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "order_id", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateInvoiceDto.prototype, "due_date", void 0);
class RecordPaymentDto {
}
exports.RecordPaymentDto = RecordPaymentDto;
__decorate([
    (0, class_validator_1.IsEnum)(PaymentMethodEnum),
    __metadata("design:type", String)
], RecordPaymentDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], RecordPaymentDto.prototype, "amount", void 0);
class UpdateInvoiceStatusDto {
}
exports.UpdateInvoiceStatusDto = UpdateInvoiceStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(InvoiceStatusEnum),
    __metadata("design:type", String)
], UpdateInvoiceStatusDto.prototype, "status", void 0);
//# sourceMappingURL=invoice.dto.js.map