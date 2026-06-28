export declare enum InvoiceStatusEnum {
    DRAFT = "DRAFT",
    SENT = "SENT",
    PARTIALLY_PAID = "PARTIALLY_PAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE",
    CANCELLED = "CANCELLED"
}
export declare enum PaymentMethodEnum {
    CASH = "CASH",
    TRANSFER = "TRANSFER",
    QRIS = "QRIS",
    EWALLET = "EWALLET",
    GATEWAY = "GATEWAY"
}
export declare class CreateInvoiceDto {
    order_id: string;
    due_date?: string;
}
export declare class RecordPaymentDto {
    method: PaymentMethodEnum;
    amount: number;
}
export declare class UpdateInvoiceStatusDto {
    status: InvoiceStatusEnum;
}
