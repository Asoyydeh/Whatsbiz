import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly apiUrl: string;
  private readonly token: string;
  private readonly phoneNumberId: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('WHATSAPP_API_URL') || 'https://graph.facebook.com/v18.0';
    this.token = this.configService.get<string>('WHATSAPP_ACCESS_TOKEN') || '';
    this.phoneNumberId = this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID') || '';
  }

  async sendTemplateMessage(to: string, templateName: string, languageCode = 'id', components: any[] = []) {
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
    } catch (err) {
      this.logger.error('Error sending WhatsApp message:', err);
      return null;
    }
  }

  async sendTextMessage(to: string, text: string) {
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
    } catch (err) {
      this.logger.error('Error sending WhatsApp message:', err);
      return null;
    }
  }
}
