import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(tenantId: string): Promise<{
        name: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        last_login: Date;
        created_at: Date;
    }[]>;
    create(tenantId: string, dto: CreateUserDto, actorId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
    update(tenantId: string, userId: string, data: {
        name?: string;
        role?: UserRole;
        is_active?: boolean;
    }, actorId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
    disable(tenantId: string, userId: string, actorId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
}
