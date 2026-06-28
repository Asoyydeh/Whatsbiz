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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToggleAutomationDto = exports.UpdateAutomationDto = exports.CreateAutomationDto = exports.FlowEdgeDto = exports.FlowNodeDto = exports.AutomationActionDto = exports.AutomationConditionDto = exports.ConditionOperator = exports.ActionType = exports.TriggerType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var TriggerType;
(function (TriggerType) {
    TriggerType["NEW_CUSTOMER"] = "NEW_CUSTOMER";
    TriggerType["NEW_MESSAGE"] = "NEW_MESSAGE";
    TriggerType["NEW_ORDER"] = "NEW_ORDER";
    TriggerType["INVOICE_OVERDUE"] = "INVOICE_OVERDUE";
    TriggerType["PAYMENT_RECEIVED"] = "PAYMENT_RECEIVED";
    TriggerType["ORDER_STATUS_CHANGED"] = "ORDER_STATUS_CHANGED";
})(TriggerType || (exports.TriggerType = TriggerType = {}));
var ActionType;
(function (ActionType) {
    ActionType["SEND_WHATSAPP"] = "SEND_WHATSAPP";
    ActionType["ASSIGN_STAFF"] = "ASSIGN_STAFF";
    ActionType["CREATE_INVOICE"] = "CREATE_INVOICE";
    ActionType["UPDATE_CUSTOMER_STATUS"] = "UPDATE_CUSTOMER_STATUS";
    ActionType["ADD_TAG"] = "ADD_TAG";
    ActionType["SEND_NOTIFICATION"] = "SEND_NOTIFICATION";
})(ActionType || (exports.ActionType = ActionType = {}));
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EQUALS"] = "EQUALS";
    ConditionOperator["NOT_EQUALS"] = "NOT_EQUALS";
    ConditionOperator["CONTAINS"] = "CONTAINS";
    ConditionOperator["GREATER_THAN"] = "GREATER_THAN";
    ConditionOperator["LESS_THAN"] = "LESS_THAN";
})(ConditionOperator || (exports.ConditionOperator = ConditionOperator = {}));
class AutomationConditionDto {
}
exports.AutomationConditionDto = AutomationConditionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutomationConditionDto.prototype, "field", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(ConditionOperator),
    __metadata("design:type", String)
], AutomationConditionDto.prototype, "operator", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutomationConditionDto.prototype, "value", void 0);
class AutomationActionDto {
}
exports.AutomationActionDto = AutomationActionDto;
__decorate([
    (0, class_validator_1.IsEnum)(ActionType),
    __metadata("design:type", String)
], AutomationActionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], AutomationActionDto.prototype, "config", void 0);
class FlowNodeDto {
}
exports.FlowNodeDto = FlowNodeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowNodeDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowNodeDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FlowNodeDto.prototype, "data", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], FlowNodeDto.prototype, "position", void 0);
class FlowEdgeDto {
}
exports.FlowEdgeDto = FlowEdgeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdgeDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdgeDto.prototype, "source", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FlowEdgeDto.prototype, "target", void 0);
class CreateAutomationDto {
}
exports.CreateAutomationDto = CreateAutomationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAutomationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateAutomationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(TriggerType),
    __metadata("design:type", String)
], CreateAutomationDto.prototype, "trigger", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateAutomationDto.prototype, "trigger_config", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => AutomationConditionDto),
    __metadata("design:type", Array)
], CreateAutomationDto.prototype, "conditions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => AutomationActionDto),
    __metadata("design:type", Array)
], CreateAutomationDto.prototype, "actions", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAutomationDto.prototype, "flow_nodes", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateAutomationDto.prototype, "flow_edges", void 0);
class UpdateAutomationDto extends CreateAutomationDto {
}
exports.UpdateAutomationDto = UpdateAutomationDto;
class ToggleAutomationDto {
}
exports.ToggleAutomationDto = ToggleAutomationDto;
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], ToggleAutomationDto.prototype, "is_active", void 0);
//# sourceMappingURL=automation.dto.js.map