"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_module_1 = require("./database/database.module");
const auth_module_1 = require("./modules/auth/auth.module");
const tenants_module_1 = require("./modules/tenants/tenants.module");
const users_module_1 = require("./modules/users/users.module");
const crm_module_1 = require("./modules/crm/crm.module");
const messages_module_1 = require("./modules/messages/messages.module");
const orders_module_1 = require("./modules/orders/orders.module");
const invoices_module_1 = require("./modules/invoices/invoices.module");
const automation_module_1 = require("./modules/automation/automation.module");
const reports_module_1 = require("./modules/reports/reports.module");
const whatsapp_module_1 = require("./modules/whatsapp/whatsapp.module");
const ai_module_1 = require("./modules/ai/ai.module");
const tenant_middleware_1 = require("./common/middleware/tenant.middleware");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(tenant_middleware_1.TenantMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '../.env',
            }),
            database_module_1.DatabaseModule,
            auth_module_1.AuthModule,
            tenants_module_1.TenantsModule,
            users_module_1.UsersModule,
            crm_module_1.CrmModule,
            messages_module_1.MessagesModule,
            orders_module_1.OrdersModule,
            invoices_module_1.InvoicesModule,
            automation_module_1.AutomationModule,
            reports_module_1.ReportsModule,
            whatsapp_module_1.WhatsappModule,
            ai_module_1.AiModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map