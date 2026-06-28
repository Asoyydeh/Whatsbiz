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
var WhatsappService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let WhatsappService = WhatsappService_1 = class WhatsappService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(WhatsappService_1.name);
        this.apiUrl = this.configService.get('WHATSAPP_API_URL') || 'https://graph.facebook.com/v18.0';
        this.token = this.configService.get('WHATSAPP_ACCESS_TOKEN') || '';
        this.phoneNumberId = this.configService.get('WHATSAPP_PHONE_NUMBER_ID') || '';
    }
    async sendTemplateMessage(to, templateName, languageCode = 'id', components = []) {
        if (!this.token || !this.phoneNumberId) {
            this.logger.warn('WhatsApp credentials are not configured. Message sending skipped.');
            return null;
        }
        const cleanedPhone = to.replace(/\D/g, '');
        const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            to: cleanedPhone,
            type: 'template',
            template: {
                name: templateName,
                language: {
                    code: languageCode,
                },
                components,
            },
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const resData = await response.json();
            if (!response.ok) {
                this.logger.error(`Failed to send WhatsApp template message: ${JSON.stringify(resData)}`);
                return null;
            }
            this.logger.log(`WhatsApp template message sent to ${cleanedPhone} successfully`);
            return resData;
        }
        catch (err) {
            this.logger.error('Error sending WhatsApp message:', err);
            return null;
        }
    }
    async sendTextMessage(to, text) {
        if (!this.token || !this.phoneNumberId) {
            this.logger.warn('WhatsApp credentials are not configured. Message sending skipped.');
            return null;
        }
        const cleanedPhone = to.replace(/\D/g, '');
        const url = `${this.apiUrl}/${this.phoneNumberId}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            to: cleanedPhone,
            type: 'text',
            text: { body: text },
        };
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            const resData = await response.json();
            if (!response.ok) {
                this.logger.error(`Failed to send WhatsApp text message: ${JSON.stringify(resData)}`);
                return null;
            }
            this.logger.log(`WhatsApp text message sent to ${cleanedPhone} successfully`);
            return resData;
        }
        catch (err) {
            this.logger.error('Error sending WhatsApp message:', err);
            return null;
        }
    }
};
exports.WhatsappService = WhatsappService;
exports.WhatsappService = WhatsappService = WhatsappService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], WhatsappService);
//# sourceMappingURL=whatsapp.service.js.map