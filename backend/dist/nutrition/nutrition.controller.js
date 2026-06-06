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
exports.NutritionController = void 0;
const common_1 = require("@nestjs/common");
const nutrition_service_1 = require("./nutrition.service");
const auth_guard_1 = require("../common/guards/auth.guard");
let NutritionController = class NutritionController {
    constructor(s) {
        this.s = s;
    }
    calculate(body) {
        return this.s.calculateForMember(body.memberId, body.activityLevel, body.calorieGoal, body.macroMode || 'lbm', body.macroRatios);
    }
    createPlan(body) {
        return this.s.createPlan(body.memberId, body.activityLevel, body.calorieGoal, body.notes, body.macroMode || 'lbm', body.macroRatios);
    }
    getActivePlan(memberId) {
        return this.s.getActivePlan(memberId);
    }
    getChart(memberId, days) {
        return this.s.getCalorieChart(memberId, days ? +days : 30);
    }
    upsertLog(planId, body) {
        return this.s.upsertDailyLog(planId, body.logDate, body);
    }
    getLogs(memberId, from, to) {
        return this.s.getDailyLogs(memberId, from, to);
    }
};
exports.NutritionController = NutritionController;
__decorate([
    (0, common_1.Post)('calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "calculate", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans/member/:memberId'),
    __param(0, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getActivePlan", null);
__decorate([
    (0, common_1.Get)('chart/:memberId'),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getChart", null);
__decorate([
    (0, common_1.Post)('plans/:planId/logs'),
    __param(0, (0, common_1.Param)('planId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "upsertLog", null);
__decorate([
    (0, common_1.Get)('logs/:memberId'),
    __param(0, (0, common_1.Param)('memberId')),
    __param(1, (0, common_1.Query)('from')),
    __param(2, (0, common_1.Query)('to')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], NutritionController.prototype, "getLogs", null);
exports.NutritionController = NutritionController = __decorate([
    (0, common_1.Controller)('nutrition'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [nutrition_service_1.NutritionService])
], NutritionController);
//# sourceMappingURL=nutrition.controller.js.map