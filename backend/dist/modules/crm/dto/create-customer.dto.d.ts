import { CustomerStatus } from '@prisma/client';
export declare class CreateCustomerDto {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    status?: CustomerStatus;
    tags?: string[];
}
