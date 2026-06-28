import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ChatGateway } from '../messages/chat.gateway';
import { MessagesService } from '../messages/messages.service';
import { WhatsappClientService } from './whatsapp-client.service';
export declare class WhatsappController {
    private readonly configService;
    private readonly prisma;
    private readonly chatGateway;
    private readonly messagesService;
    private readonly whatsappClient;
    private readonly logger;
    constructor(configService: ConfigService, prisma: PrismaService, chatGateway: ChatGateway, messagesService: MessagesService, whatsappClient: WhatsappClientService);
    getConnectionStatus(req: any): {
        status: import("./whatsapp-client.service").WhatsappStatus;
        qr: string;
        number: string;
        pairingCode: string;
    };
    getPairingCode(req: any, body: {
        phone: string;
    }): Promise<{
        code: string;
    }>;
    logout(req: any): Promise<{
        message: string;
    }>;
    verifyWebhook(mode: string, token: string, challenge: string, res: Response): Response<any, Record<string, any>>;
    handleWebhook(body: any): Promise<{
        status: string;
        messageId?: undefined;
        error?: undefined;
    } | {
        status: string;
        messageId: string;
        error?: undefined;
    } | {
        status: string;
        error: any;
        messageId?: undefined;
    }>;
}
