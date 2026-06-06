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
exports.DailyCalorieLog = exports.NutritionPlan = exports.ACTIVITY_MULTIPLIER = exports.ActivityLevel = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
var ActivityLevel;
(function (ActivityLevel) {
    ActivityLevel["SEDENTARY"] = "sedentary";
    ActivityLevel["LIGHT"] = "light";
    ActivityLevel["MODERATE"] = "moderate";
    ActivityLevel["HEAVY"] = "heavy";
    ActivityLevel["VERY_HEAVY"] = "very_heavy";
})(ActivityLevel || (exports.ActivityLevel = ActivityLevel = {}));
exports.ACTIVITY_MULTIPLIER = {
    [ActivityLevel.SEDENTARY]: 1.2,
    [ActivityLevel.LIGHT]: 1.375,
    [ActivityLevel.MODERATE]: 1.55,
    [ActivityLevel.HEAVY]: 1.725,
    [ActivityLevel.VERY_HEAVY]: 1.9,
};
let NutritionPlan = class NutritionPlan extends base_entity_1.BaseEntity {
};
exports.NutritionPlan = NutritionPlan;
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (m) => m.nutritionPlans),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], NutritionPlan.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'member_id' }),
    __metadata("design:type", String)
], NutritionPlan.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activity_level', type: 'enum', enum: ActivityLevel }),
    __metadata("design:type", String)
], NutritionPlan.prototype, "activityLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "lbm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 7, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "bmr", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 7, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "tdee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_calories', type: 'decimal', precision: 7, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "targetCalories", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'protein_g', type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "proteinG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fat_g', type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "fatG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carb_g', type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "carbG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calorie_goal', type: 'decimal', precision: 7, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], NutritionPlan.prototype, "calorieGoal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], NutritionPlan.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], NutritionPlan.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => DailyCalorieLog, (d) => d.nutritionPlan, { cascade: true }),
    __metadata("design:type", Array)
], NutritionPlan.prototype, "dailyLogs", void 0);
exports.NutritionPlan = NutritionPlan = __decorate([
    (0, typeorm_1.Entity)('nutrition_plans')
], NutritionPlan);
let DailyCalorieLog = class DailyCalorieLog extends base_entity_1.BaseEntity {
};
exports.DailyCalorieLog = DailyCalorieLog;
__decorate([
    (0, typeorm_1.ManyToOne)(() => NutritionPlan, (n) => n.dailyLogs),
    (0, typeorm_1.JoinColumn)({ name: 'nutrition_plan_id' }),
    __metadata("design:type", NutritionPlan)
], DailyCalorieLog.prototype, "nutritionPlan", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nutrition_plan_id' }),
    __metadata("design:type", String)
], DailyCalorieLog.prototype, "nutritionPlanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'log_date', type: 'date' }),
    __metadata("design:type", Date)
], DailyCalorieLog.prototype, "logDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'calories_consumed', type: 'decimal', precision: 7, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyCalorieLog.prototype, "caloriesConsumed", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'protein_g', type: 'decimal', precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyCalorieLog.prototype, "proteinG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fat_g', type: 'decimal', precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyCalorieLog.prototype, "fatG", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'carb_g', type: 'decimal', precision: 6, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], DailyCalorieLog.prototype, "carbG", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], DailyCalorieLog.prototype, "notes", void 0);
exports.DailyCalorieLog = DailyCalorieLog = __decorate([
    (0, typeorm_1.Entity)('daily_calorie_logs')
], DailyCalorieLog);
//# sourceMappingURL=nutrition-plan.entity.js.map