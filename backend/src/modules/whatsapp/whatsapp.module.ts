import { Module } from '@nestjs/common';
import { WhatsappController } from './whatsapp.controller';
import { WhatsappService } from './whatsapp.service';
import { WhatsappClientService } from './whatsapp-client.service';
import { DatabaseModule } from '../../database/database.module';
import { MessagesModule } from '../messages/messages.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DatabaseModule, MessagesModule, AiModule],
  controllers: [WhatsappController],
  providers: [WhatsappService, WhatsappClientService],
  exports: [WhatsappService, WhatsappClientService],
})
export class WhatsappModule {}
