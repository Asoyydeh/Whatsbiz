import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CreateConversationDto } from './dto/send-message.dto';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get('conversations')
  getConversations(@Request() req: any) {
    return this.messagesService.getConversations(req.user.tenantId);
  }

  @Post('conversations')
  createConversation(@Request() req: any, @Body() dto: CreateConversationDto) {
    return this.messagesService.getOrCreateConversation(req.user.tenantId, dto);
  }

  @Get('conversations/:id')
  getConversationDetail(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.getConversationWithCustomer(req.user.tenantId, id);
  }

  @Get('conversations/:id/messages')
  getMessages(
    @Request() req: any,
    @Param('id') id: string,
    @Query('page') page = '1',
    @Query('limit') limit = '50',
  ) {
    return this.messagesService.getMessages(
      req.user.tenantId,
      id,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Patch('conversations/:id/read')
  markAsRead(@Request() req: any, @Param('id') id: string) {
    return this.messagesService.markAsRead(req.user.tenantId, id);
  }
}
