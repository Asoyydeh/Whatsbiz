import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, Min } from 'class-validator';

export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethodEnum {
  CASH = 'CASH',
  TRANSFER = 'TRANSFER',
  QRIS = 'QRIS',
  EWALLET = 'EWALLET',
  GATEWAY = 'GATEWAY',
}

export class CreateInvoiceDto {
  @IsString()
  order_id: string;

  @IsDateString()
  @IsOptional()
  due_date?: string;
}

export class RecordPaymentDto {
  @IsEnum(PaymentMethodEnum)
  method: PaymentMethodEnum;

  @IsNumber()
  @Min(1)
  amount: number;
}

export class UpdateInvoiceStatusDto {
  @IsEnum(InvoiceStatusEnum)
  status: InvoiceStatusEnum;
}
