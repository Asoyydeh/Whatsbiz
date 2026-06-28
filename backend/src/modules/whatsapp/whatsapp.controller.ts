import { Controller, Get, Post, Body, Query, HttpCode, HttpStatus, Req, Res, Logger, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { ChatGateway } from '../messages/chat.gateway';
import { MessagesService } from '../messages/messages.service';
import { WhatsappClientService } from './whatsapp-client.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('whatsapp')
export class WhatsappController {
  private readonly logger = new Logger(WhatsappController.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly chatGateway: ChatGateway,
    private readonly messagesService: MessagesService,
    private readonly whatsappClient: WhatsappClientService,
  ) {}

  /** Get current WhatsApp connection status, QR code or pairing code */
  @Get('status')
  @UseGuards(AuthGuard('jwt'))
  getConnectionStatus(@Req() req: any) {
    const tenantId = req.user.tenantId;
    return this.whatsappClient.getStatus(tenantId);
  }

  /** Request an 8-digit pairing code to login via phone number */
  @Post('pairing-code')
  @UseGuards(AuthGuard('jwt'))
  async getPairingCode(@Req() req: any, @Body() body: { phone: string }) {
    const tenantId = req.user.tenantId;
    const code = await this.whatsappClient.connectWithPairingCode(tenantId, body.phone);
    return { code };
  }

  /** Logout / disconnect WhatsApp Web session */
  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req: any) {
    const tenantId = req.user.tenantId;
    await this.whatsappClient.logout(tenantId);
    return { message: 'WhatsApp disconnected successfully' };
  }

  /** Webhook verification for Meta WhatsApp Cloud API */
  @Get('webhook')
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
    @Res() res: Response,
  ) {
    const verifyToken = this.configService.get<string>('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'whatsbiz_verify_token';

    if (mode && token) {
      if (mode === 'subscribe' && token === verifyToken) {
        this.logger.log('WhatsApp Webhook verified successfully');
        return res.status(HttpStatus.OK).send(challenge);
      }
    }
    this.logger.warn('WhatsApp Webhook verification failed');
    return res.status(HttpStatus.FORBIDDEN).send('Forbidden');
  }

  /** Handle incoming messages webhook */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    // Return early to Meta to avoid timeout retries
    this.logger.log('WhatsApp Webhook received callback payload');

    try {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const val = change?.value;
      const message = val?.messages?.[0];

      if (!message) {
        return { status: 'ignored' };
      }

      const phone = message.from; // Sender phone number e.g. "628123456789"
      const messageId = message.id;
      const textBody = message.text?.body || '';
      const messageType = message.type?.toUpperCase() || 'TEXT';

      // Find customer by phone number
      let customer = await this.prisma.customer.findFirst({
        where: {
          phone: { contains: phone },
          deleted_at: null,
        },
      });

      // If customer doesn't exist, we map it to the first tenant in the database
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

      // Get or create conversation
      const conversation = await this.messagesService.getOrCreateConversation(customer.tenant_id, {
        customer_id: customer.id,
      });

      // Save incoming message in the DB
      // We pass null as senderId to represent that it is sent by the customer (not an agent)
      const savedMessage = await this.prisma.message.create({
        data: {
          tenant_id: customer.tenant_id,
          conversation_id: conversation.id,
          sender_id: null,
          type: messageType === 'TEXT' ? 'TEXT' : 'TEXT', // default to text for simplicity
          content: textBody,
          status: 'delivered',
        },
      });

      // Update conversation details
      await this.prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          last_message: textBody,
          unread_count: { increment: 1 },
          updated_at: new Date(),
        },
      });

      // Broadcast the new message via Socket.IO to the frontend in real-time
      this.chatGateway.server.to(`tenant:${customer.tenant_id}`).emit('message:new', {
        message: savedMessage,
        conversationId: conversation.id,
      });

      this.logger.log(`Incoming message saved and emitted for tenant: ${customer.tenant_id}`);
      return { status: 'success', messageId: savedMessage.id };
    } catch (err) {
      this.logger.error('Error processing incoming WhatsApp webhook:', err);
      return { status: 'error', error: err.message };
    }
  }
}
