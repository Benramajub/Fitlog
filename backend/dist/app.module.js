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
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const members_module_1 = require("./members/members.module");
const sessions_module_1 = require("./sessions/sessions.module");
const programs_module_1 = require("./programs/programs.module");
const nutrition_module_1 = require("./nutrition/nutrition.module");
const calendar_module_1 = require("./calendar/calendar.module");
const workout_logs_module_1 = require("./workout-logs/workout-logs.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    type: 'postgres',
                    host: cfg.get('DB_HOST', 'localhost'),
                    port: cfg.get('DB_PORT', 5432),
                    username: cfg.get('DB_USER', 'fitlog'),
                    password: cfg.get('DB_PASS', 'fitlog_secret'),
                    database: cfg.get('DB_NAME', 'fitlog_pro'),
                    autoLoadEntities: true,
                    synchronize: cfg.get('NODE_ENV') === 'development',
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            members_module_1.MembersModule,
            sessions_module_1.SessionsModule,
            programs_module_1.ProgramsModule,
            nutrition_module_1.NutritionModule,
            calendar_module_1.CalendarModule,
            workout_logs_module_1.WorkoutLogsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map