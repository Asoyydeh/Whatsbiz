import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Request } from 'express';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(req: Request): Promise<{
        name: string;
        email: string;
        id: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
        last_login: Date;
        created_at: Date;
    }[]>;
    create(req: Request, createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
    update(req: Request, id: string, body: {
        name?: string;
        role?: UserRole;
        is_active?: boolean;
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
    disable(req: Request, id: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.UserRole;
        is_active: boolean;
    }>;
}
