"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatsappModule = void 0;
const common_1 = require("@nestjs/common");
const whatsapp_controller_1 = require("./whatsapp.controller");
const whatsapp_service_1 = require("./whatsapp.service");
const whatsapp_client_service_1 = require("./whatsapp-client.service");
const database_module_1 = require("../../database/database.module");
const messages_module_1 = require("../messages/messages.module");
const ai_module_1 = require("../ai/ai.module");
let WhatsappModule = class WhatsappModule {
};
exports.WhatsappModule = WhatsappModule;
exports.WhatsappModule = WhatsappModule = __decorate([
    (0, common_1.Module)({
        imports: [database_module_1.DatabaseModule, messages_module_1.MessagesModule, ai_module_1.AiModule],
        controllers: [whatsapp_controller_1.WhatsappController],
        providers: [whatsapp_service_1.WhatsappService, whatsapp_client_service_1.WhatsappClientService],
        exports: [whatsapp_service_1.WhatsappService, whatsapp_client_service_1.WhatsappClientService],
    })
], WhatsappModule);
//# sourceMappingURL=whatsapp.module.js.map