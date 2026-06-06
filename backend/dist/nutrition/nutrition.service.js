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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NutritionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const nutrition_plan_entity_1 = require("../database/entities/nutrition-plan.entity");
const member_entity_1 = require("../database/entities/member.entity");
const member_entity_2 = require("../database/entities/member.entity");
let NutritionService = class NutritionService {
    constructor(planRepo, logRepo, memberRepo) {
        this.planRepo = planRepo;
        this.logRepo = logRepo;
        this.memberRepo = memberRepo;
    }
    calculateLBM(weight, height, gender) {
        if (gender === member_entity_2.Gender.MALE) {
            return 0.407 * weight + 0.267 * height - 19.2;
        }
        return 0.252 * weight + 0.473 * height - 48.3;
    }
    calculateBMR(weight, height, age, gender) {
        const lbm = this.calculateLBM(weight, height, gender);
        return 370 + 21.6 * lbm;
    }
    calculateTDEE(bmr, activity) {
        return bmr * nutrition_plan_entity_1.ACTIVITY_MULTIPLIER[activity];
    }
    calculateMacros(lbm, tdee, mode = 'lbm', ratios) {
        let protein, fat, carb;
        if (mode === 'ratio' && ratios) {
            protein = (tdee * (ratios.proteinPct / 100)) / 4;
            fat = (tdee * (ratios.fatPct / 100)) / 9;
            carb = (tdee * (ratios.carbPct / 100)) / 4;
        }
        else {
            protein = lbm * 1.6;
            fat = (tdee * 0.25) / 9;
            carb = (tdee - protein * 4 - fat * 9) / 4;
        }
        return {
            proteinG: Math.round(protein * 10) / 10,
            fatG: Math.round(fat * 10) / 10,
            carbG: Math.round(Math.max(0, carb) * 10) / 10,
        };
    }
    async calculateForMember(memberId, activityLevel, calorieGoal, macroMode = 'lbm', macroRatios) {
        const member = await this.memberRepo.findOne({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        const lbm = this.calculateLBM(+member.weight, +member.height, member.gender);
        const bmr = this.calculateBMR(+member.weight, +member.height, member.age, member.gender);
        const tdee = this.calculateTDEE(bmr, activityLevel);
        const targetCalories = calorieGoal || tdee;
        const macros = this.calculateMacros(lbm, targetCalories, macroMode, macroRatios);
        const proteinPct = Math.round((macros.proteinG * 4 / targetCalories) * 100);
        const fatPct = Math.round((macros.fatG * 9 / targetCalories) * 100);
        const carbPct = Math.round((macros.carbG * 4 / targetCalories) * 100);
        return {
            lbm: Math.round(lbm * 10) / 10,
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            targetCalories: Math.round(targetCalories),
            macroMode,
            ...macros,
            proteinPct, fatPct, carbPct,
        };
    }
    async createPlan(memberId, activityLevel, calorieGoal, notes, macroMode = 'lbm', macroRatios) {
        const calc = await this.calculateForMember(memberId, activityLevel, calorieGoal, macroMode, macroRatios);
        await this.planRepo.update({ memberId, isActive: true }, { isActive: false });
        const plan = this.planRepo.create({
            memberId,
            activityLevel,
            lbm: calc.lbm,
            bmr: calc.bmr,
            tdee: calc.tdee,
            targetCalories: calc.targetCalories,
            proteinG: calc.proteinG,
            fatG: calc.fatG,
            carbG: calc.carbG,
            calorieGoal,
            isActive: true,
            notes,
        });
        return this.planRepo.save(plan);
    }
    async getActivePlan(memberId) {
        return this.planRepo.findOne({
            where: { memberId, isActive: true },
            relations: ['dailyLogs'],
            order: { createdAt: 'DESC' },
        });
    }
    async upsertDailyLog(nutritionPlanId, logDate, data) {
        let log = await this.logRepo.findOne({ where: { nutritionPlanId, logDate: new Date(logDate) } });
        if (!log) {
            log = this.logRepo.create({ nutritionPlanId, logDate: new Date(logDate) });
        }
        Object.assign(log, data);
        return this.logRepo.save(log);
    }
    async getDailyLogs(memberId, fromDate, toDate) {
        const plan = await this.getActivePlan(memberId);
        if (!plan)
            return [];
        return this.logRepo
            .createQueryBuilder('l')
            .where('l.nutritionPlanId = :pid', { pid: plan.id })
            .andWhere('l.logDate BETWEEN :from AND :to', { from: fromDate, to: toDate })
            .orderBy('l.logDate', 'ASC')
            .getMany();
    }
    async getCalorieChart(memberId, days = 30) {
        const from = (0, dayjs_1.default)().subtract(days, 'day').format('YYYY-MM-DD');
        const to = (0, dayjs_1.default)().format('YYYY-MM-DD');
        const plan = await this.getActivePlan(memberId);
        if (!plan)
            return { logs: [], target: 0 };
        const logs = await this.getDailyLogs(memberId, from, to);
        return {
            logs,
            target: plan.targetCalories,
            plan,
        };
    }
};
exports.NutritionService = NutritionService;
exports.NutritionService = NutritionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(nutrition_plan_entity_1.NutritionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(nutrition_plan_entity_1.DailyCalorieLog)),
    __param(2, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], NutritionService);
//# sourceMappingURL=nutrition.service.js.map