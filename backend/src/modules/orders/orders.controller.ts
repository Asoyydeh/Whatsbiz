import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, UpdateOrderDto } from './dto/order.dto';

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  /** GET /orders/kanban — returns orders grouped by status column */
  @Get('kanban')
  getKanban(@Request() req: any) {
    return this.ordersService.getKanbanBoard(req.user.tenantId);
  }

  /** GET /orders/stats — summary counts and revenue */
  @Get('stats')
  getStats(@Request() req: any) {
    return this.ordersService.getOrderStats(req.user.tenantId);
  }

  /** GET /orders */
  @Get()
  getOrders(
    @Request() req: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
  ) {
    return this.ordersService.getOrders(
      req.user.tenantId,
      parseInt(page, 10),
      parseInt(limit, 10),
      status,
    );
  }

  /** GET /orders/:id */
  @Get(':id')
  getOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrderById(req.user.tenantId, id);
  }

  /** POST /orders */
  @Post()
  createOrder(@Request() req: any, @Body() dto: CreateOrderDto) {
    return this.ordersService.createOrder(req.user.tenantId, req.user.id, dto);
  }

  /** PATCH /orders/:id/status */
  @Patch(':id/status')
  updateStatus(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(req.user.tenantId, id, dto);
  }

  /** PATCH /orders/:id */
  @Patch(':id')
  updateOrder(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateOrderDto,
  ) {
    return this.ordersService.updateOrder(req.user.tenantId, id, dto);
  }

  /** DELETE /orders/:id */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.deleteOrder(req.user.tenantId, id);
  }
}
