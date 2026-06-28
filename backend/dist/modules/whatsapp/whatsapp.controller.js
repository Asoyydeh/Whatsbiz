"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatsappController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
const chat_gateway_1 = require("../messages/chat.gateway");
const messages_service_1 = require("../messages/messages.service");
const whatsapp_client_service_1 = require("./whatsapp-client.service");
const passport_1 = require("@nestjs/passport");
let WhatsappController = WhatsappController_1 = class WhatsappController {
    constructor(configService, prisma, chatGateway, messagesService, whatsappClient) {
        this.configService = configService;
        this.prisma = prisma;
        this.chatGateway = chatGateway;
        this.messagesService = messagesService;
        this.whatsappClient = whatsappClient;
        this.logger = new common_1.Logger(WhatsappController_1.name);
    }
    getConnectionStatus(req) {
        const tenantId = req.user.tenantId;
        return this.whatsappClient.getStatus(tenantId);
    }
    async getPairingCode(req, body) {
        const tenantId = req.user.tenantId;
        const code = await this.whatsappClient.connectWithPairingCode(tenantId, body.phone);
        return { code };
    }
    async logout(req) {
        const tenantId = req.user.tenantId;
        await this.whatsappClient.logout(tenantId);
        return { message: 'WhatsApp disconnected successfully' };
    }
    verifyWebhook(mode, token, challenge, res) {
        const verifyToken = this.configService.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'whatsbiz_verify_token';
        if (mode && token) {
            if (mode === 'subscribe' && token === verifyToken) {
                this.logger.log('WhatsApp Webhook verified successfully');
                return res.status(common_1.HttpStatus.OK).send(challenge);
            }
        }
        this.logger.warn('WhatsApp Webhook verification failed');
        return res.status(common_1.HttpStatus.FORBIDDEN).send('Forbidden');
    }
    async handleWebhook(body) {
        this.logger.log('WhatsApp Webhook received callback payload');
        try {
            const entry = body.entry?.[0];
            const change = entry?.changes?.[0];
            const val = change?.value;
            const message = val?.messages?.[0];
            if (!message) {
                return { status: 'ignored' };
            }
            const phone = message.from;
            const messageId = message.id;
            const textBody = message.text?.body || '';
            const messageType = message.type?.toUpperCase() || 'TEXT';
            let customer = await this.prisma.customer.findFirst({
                where: {
                    phone: { contains: phone },
                    deleted_at: null,
                },
            });
            if (!customer) {
                const firstTenant = await this.prisma.tenant.findFirst();
                if (!firstTenant) {
                    this.logger.warn('No tenant registered in database. Cannot map incoming message.');
                    return { status: 'no_tenant' };
                }
                const profileName = val?.contacts?.[0]?.profile?.name || `WhatsApp User ${phone}`;
                customer = await this.prisma.customer.create({
                    data: {
                        tenant_id: firstTenant.id,
                        name: profileName,
                        phone: phone,
                        status: 'LEAD',
                    },
                });
                this.logger.log(`Created new customer ${customer.name} under tenant ${firstTenant.name} from WhatsApp webhook`);
            }
            const conversation = await this.messagesService.getOrCreateConversation(customer.tenant_id, {
                customer_id: customer.id,
            });
            const savedMessage = await this.prisma.message.create({
                data: {
                    tenant_id: customer.tenant_id,
                    conversation_id: conversation.id,
                    sender_id: null,
                    type: messageType === 'TEXT' ? 'TEXT' : 'TEXT',
                    content: textBody,
                    status: 'delivered',
                },
            });
            await this.prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    last_message: textBody,
                    unread_count: { increment: 1 },
                    updated_at: new Date(),
                },
            });
            this.chatGateway.server.to(`tenant:${customer.tenant_id}`).emit('message:new', {
                message: savedMessage,
                conversationId: conversation.id,
            });
            this.logger.log(`Incoming message saved and emitted for tenant: ${customer.tenant_id}`);
            return { status: 'success', messageId: savedMessage.id };
        }
        catch (err) {
            this.logger.error('Error processing incoming WhatsApp webhook:', err);
            return { status: 'error', error: err.message };
        }
    }
};
exports.WhatsappController = WhatsappController;
__decorate([
    (0, common_1.Get)('status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "getConnectionStatus", null);
__decorate([
    (0, common_1.Post)('pairing-code'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "getPairingCode", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('webhook'),
    __param(0, (0, common_1.Query)('hub.mode')),
    __param(1, (0, common_1.Query)('hub.verify_token')),
    __param(2, (0, common_1.Query)('hub.challenge')),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", void 0)
], WhatsappController.prototype, "verifyWebhook", null);
__decorate([
    (0, common_1.Post)('webhook'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WhatsappController.prototype, "handleWebhook", null);
exports.WhatsappController = WhatsappController = WhatsappController_1 = __decorate([
    (0, common_1.Controller)('whatsapp'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService,
        chat_gateway_1.ChatGateway,
        messages_service_1.MessagesService,
        whatsapp_client_service_1.WhatsappClientService])
], WhatsappController);
//# sourceMappingURL=whatsapp.controller.js.map