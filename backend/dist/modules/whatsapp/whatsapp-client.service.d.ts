import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ChatGateway } from '../messages/chat.gateway';
import { AiService } from '../ai/ai.service';
export type WhatsappStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'QR_READY';
export declare class WhatsappClientService implements OnModuleInit {
    private readonly prisma;
    private readonly chatGateway;
    private readonly aiService;
    private readonly logger;
    private socks;
    private statuses;
    private qrCodeUrls;
    private connectedNumbers;
    private pairingCodes;
    constructor(prisma: PrismaService, chatGateway: ChatGateway, aiService: AiService);
    onModuleInit(): Promise<void>;
    getStatus(tenantId?: string): {
        status: WhatsappStatus;
        qr: string;
        number: string;
        pairingCode: string;
    };
    private getSessionPath;
    private startWhatsapp;
    private broadcastStatus;
    private handleIncomingMessage;
    private getOrCreateConversation;
    private emitNewMessage;
    connectWithPairingCode(tenantId: string, phoneNumber: string): Promise<string>;
    logout(tenantId?: string): Promise<void>;
    private clearSessionFolder;
}
