import { IsString, IsBoolean, IsOptional, IsObject, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum TriggerType {
  NEW_CUSTOMER = 'NEW_CUSTOMER',
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_ORDER = 'NEW_ORDER',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  ORDER_STATUS_CHANGED = 'ORDER_STATUS_CHANGED',
}

export enum ActionType {
  SEND_WHATSAPP = 'SEND_WHATSAPP',
  ASSIGN_STAFF = 'ASSIGN_STAFF',
  CREATE_INVOICE = 'CREATE_INVOICE',
  UPDATE_CUSTOMER_STATUS = 'UPDATE_CUSTOMER_STATUS',
  ADD_TAG = 'ADD_TAG',
  SEND_NOTIFICATION = 'SEND_NOTIFICATION',
}

export enum ConditionOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
}

export class AutomationConditionDto {
  @IsString()
  field: string;

  @IsEnum(ConditionOperator)
  operator: ConditionOperator;

  @IsString()
  value: string;
}

export class AutomationActionDto {
  @IsEnum(ActionType)
  type: ActionType;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class FlowNodeDto {
  @IsString()
  id: string;

  @IsString()
  type: string; // 'trigger' | 'condition' | 'action'

  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @IsObject()
  @IsOptional()
  position?: { x: number; y: number };
}

export class FlowEdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;
}

export class CreateAutomationDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TriggerType)
  trigger: TriggerType;

  @IsObject()
  @IsOptional()
  trigger_config?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => AutomationConditionDto)
  conditions?: AutomationConditionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => AutomationActionDto)
  actions?: AutomationActionDto[];

  @IsArray()
  @IsOptional()
  flow_nodes?: FlowNodeDto[];

  @IsArray()
  @IsOptional()
  flow_edges?: FlowEdgeDto[];
}

export class UpdateAutomationDto extends CreateAutomationDto {}

export class ToggleAutomationDto {
  @IsBoolean()
  is_active: boolean;
}
