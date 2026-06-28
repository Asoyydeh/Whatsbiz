export declare enum TriggerType {
    NEW_CUSTOMER = "NEW_CUSTOMER",
    NEW_MESSAGE = "NEW_MESSAGE",
    NEW_ORDER = "NEW_ORDER",
    INVOICE_OVERDUE = "INVOICE_OVERDUE",
    PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
    ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED"
}
export declare enum ActionType {
    SEND_WHATSAPP = "SEND_WHATSAPP",
    ASSIGN_STAFF = "ASSIGN_STAFF",
    CREATE_INVOICE = "CREATE_INVOICE",
    UPDATE_CUSTOMER_STATUS = "UPDATE_CUSTOMER_STATUS",
    ADD_TAG = "ADD_TAG",
    SEND_NOTIFICATION = "SEND_NOTIFICATION"
}
export declare enum ConditionOperator {
    EQUALS = "EQUALS",
    NOT_EQUALS = "NOT_EQUALS",
    CONTAINS = "CONTAINS",
    GREATER_THAN = "GREATER_THAN",
    LESS_THAN = "LESS_THAN"
}
export declare class AutomationConditionDto {
    field: string;
    operator: ConditionOperator;
    value: string;
}
export declare class AutomationActionDto {
    type: ActionType;
    config?: Record<string, any>;
}
export declare class FlowNodeDto {
    id: string;
    type: string;
    data?: Record<string, any>;
    position?: {
        x: number;
        y: number;
    };
}
export declare class FlowEdgeDto {
    id: string;
    source: string;
    target: string;
}
export declare class CreateAutomationDto {
    name: string;
    description?: string;
    trigger: TriggerType;
    trigger_config?: Record<string, any>;
    conditions?: AutomationConditionDto[];
    actions?: AutomationActionDto[];
    flow_nodes?: FlowNodeDto[];
    flow_edges?: FlowEdgeDto[];
}
export declare class UpdateAutomationDto extends CreateAutomationDto {
}
export declare class ToggleAutomationDto {
    is_active: boolean;
}
