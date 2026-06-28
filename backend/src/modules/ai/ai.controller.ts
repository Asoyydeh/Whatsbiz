import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AiService } from './ai.service';

@Controller('ai')
@UseGuards(AuthGuard('jwt'))
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('config')
  async getConfig(@Request() req: any) {
    return this.aiService.getAgentConfig(req.user.tenantId);
  }

  @Post('config')
  async updateConfig(@Request() req: any, @Body() body: any) {
    return this.aiService.updateAgentConfig(req.user.tenantId, body);
  }

  @Get('logs')
  async getLogs(@Request() req: any) {
    return this.aiService.getRouterLogs(req.user.tenantId);
  }

  @Get('stats')
  async getStats(@Request() req: any) {
    return this.aiService.getStats(req.user.tenantId);
  }

  @Post('test')
  async testAgent(@Request() req: any, @Body() body: any) {
    // Membantu playground frontend untuk mengetes prompt
    const { prompt, history } = body;
    const response = await this.aiService.generateResponse(
      req.user.tenantId,
      prompt,
      history || [],
    );
    return { response };
  }
}
