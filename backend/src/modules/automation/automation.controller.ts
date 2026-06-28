import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AutomationService } from './automation.service';
import { CreateAutomationDto, UpdateAutomationDto, ToggleAutomationDto } from './dto/automation.dto';

@Controller('automation')
@UseGuards(AuthGuard('jwt'))
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Get('stats')
  getStats(@Request() req: any) {
    return this.automationService.getStats(req.user.tenantId);
  }

  @Get()
  getAll(@Request() req: any) {
    return this.automationService.getAutomations(req.user.tenantId);
  }

  @Get(':id')
  getOne(@Request() req: any, @Param('id') id: string) {
    return this.automationService.getAutomationById(req.user.tenantId, id);
  }

  @Post()
  create(@Request() req: any, @Body() dto: CreateAutomationDto) {
    return this.automationService.createAutomation(req.user.tenantId, dto);
  }

  @Put(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateAutomationDto) {
    return this.automationService.updateAutomation(req.user.tenantId, id, dto);
  }

  @Patch(':id/toggle')
  toggle(@Request() req: any, @Param('id') id: string, @Body() dto: ToggleAutomationDto) {
    return this.automationService.toggleAutomation(req.user.tenantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.automationService.deleteAutomation(req.user.tenantId, id);
  }
}
