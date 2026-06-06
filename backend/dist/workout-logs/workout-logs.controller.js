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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutLogsController = void 0;
const common_1 = require("@nestjs/common");
const workout_logs_service_1 = require("./workout-logs.service");
const auth_guard_1 = require("../common/guards/auth.guard");
let WorkoutLogsController = class WorkoutLogsController {
    constructor(s) {
        this.s = s;
    }
    getForSession(id) {
        return this.s.getLogsForSession(id);
    }
    getPrefilled(id) {
        return this.s.getPrefilled(id);
    }
    getPrefilledFromDay(dayId) {
        return this.s.getPrefilledFromDay(dayId);
    }
    getHistory(memberId, exercise) {
        return this.s.getMemberHistory(memberId, exercise);
    }
    saveLog(sessionId, dto) {
        return this.s.saveLog(sessionId, dto);
    }
    saveBulk(sessionId, body) {
        return this.s.saveBulk(sessionId, body.logs);
    }
    update(id, dto) {
        return this.s.updateLog(id, dto);
    }
    remove(id) {
        return this.s.deleteLog(id);
    }
};
exports.WorkoutLogsController = WorkoutLogsController;
__decorate([
    (0, common_1.Get)("session/:sessionId"),
    __param(0, (0, common_1.Param)("sessionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "getForSession", null);
__decorate([
    (0, common_1.Get)("session/:sessionId/prefilled"),
    __param(0, (0, common_1.Param)("sessionId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "getPrefilled", null);
__decorate([
    (0, common_1.Get)("prefilled-day/:dayId"),
    __param(0, (0, common_1.Param)("dayId")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "getPrefilledFromDay", null);
__decorate([
    (0, common_1.Get)("history/:memberId"),
    __param(0, (0, common_1.Param)("memberId")),
    __param(1, (0, common_1.Query)("exercise")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Post)("session/:sessionId"),
    (0, auth_guard_1.Roles)("admin"),
    __param(0, (0, common_1.Param)("sessionId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "saveLog", null);
__decorate([
    (0, common_1.Post)("session/:sessionId/bulk"),
    (0, auth_guard_1.Roles)("admin"),
    __param(0, (0, common_1.Param)("sessionId")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "saveBulk", null);
__decorate([
    (0, common_1.Patch)(":id"),
    (0, auth_guard_1.Roles)("admin"),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(":id"),
    (0, auth_guard_1.Roles)("admin"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WorkoutLogsController.prototype, "remove", null);
exports.WorkoutLogsController = WorkoutLogsController = __decorate([
    (0, common_1.Controller)("workout-logs"),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [workout_logs_service_1.WorkoutLogsService])
], WorkoutLogsController);
//# sourceMappingURL=workout-logs.controller.js.map