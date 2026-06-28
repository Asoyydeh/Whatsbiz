import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Request } from 'express';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        message: string;
        tenant: {
            id: string;
            name: string;
            domain: string;
        };
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    login(loginDto: LoginDto, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refresh(refreshDto: RefreshDto, ip: string, userAgent: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    logout(req: Request, ip: string): Promise<{
        message: string;
    }>;
    getSession(req: Request): {
        success: boolean;
        user: {
            id: any;
            email: any;
            role: any;
            tenant_id: any;
        };
    };
}
