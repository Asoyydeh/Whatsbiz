import { CustomerStatus } from '@prisma/client';
export declare class UpdateCustomerDto {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    status?: CustomerStatus;
    tags?: string[];
}
