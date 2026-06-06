"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutLogsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const workout_log_entity_1 = require("../database/entities/workout-log.entity");
const session_entity_1 = require("../database/entities/session.entity");
const program_entity_1 = require("../database/entities/program.entity");
const program_entity_2 = require("../database/entities/program.entity");
const workout_logs_controller_1 = require("./workout-logs.controller");
const workout_logs_service_1 = require("./workout-logs.service");
let WorkoutLogsModule = class WorkoutLogsModule {
};
exports.WorkoutLogsModule = WorkoutLogsModule;
exports.WorkoutLogsModule = WorkoutLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([workout_log_entity_1.WorkoutLog, session_entity_1.Session, program_entity_1.ProgramDay, program_entity_2.Program]),
        ],
        controllers: [workout_logs_controller_1.WorkoutLogsController],
        providers: [workout_logs_service_1.WorkoutLogsService],
        exports: [workout_logs_service_1.WorkoutLogsService],
    })
], WorkoutLogsModule);
//# sourceMappingURL=workout-logs.module.js.map