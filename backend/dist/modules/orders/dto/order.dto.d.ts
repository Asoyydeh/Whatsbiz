export declare enum OrderStatusEnum {
    DRAFT = "DRAFT",
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    DELIVERED = "DELIVERED",
    CANCELLED = "CANCELLED"
}
export declare class OrderItemDto {
    name: string;
    quantity: number;
    price: number;
}
export declare class CreateOrderDto {
    customer_id: string;
    items: OrderItemDto[];
    discount?: number;
    tax?: number;
    notes?: string;
}
export declare class UpdateOrderStatusDto {
    status: OrderStatusEnum;
}
export declare class UpdateOrderDto {
    customer_id?: string;
    items?: OrderItemDto[];
    discount?: number;
    tax?: number;
}
