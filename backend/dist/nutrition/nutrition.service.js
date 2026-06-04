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
    calculateBMR(weight, height, age, gender) {
        if (gender === member_entity_2.Gender.MALE) {
            return 66 + 13.7 * weight + 5 * height - 6.8 * age;
        }
        return 665 + 9.6 * weight + 1.8 * height - 4.7 * age;
    }
    calculateTDEE(bmr, activity) {
        return bmr * nutrition_plan_entity_1.ACTIVITY_MULTIPLIER[activity];
    }
    calculateMacros(weight, tdee) {
        const protein = weight * 1.6;
        const fat = (tdee * 0.25) / 9;
        const proteinCal = protein * 4;
        const fatCal = fat * 9;
        const carbCal = tdee - proteinCal - fatCal;
        const carb = carbCal / 4;
        return {
            proteinG: Math.round(protein * 10) / 10,
            fatG: Math.round(fat * 10) / 10,
            carbG: Math.round(carb * 10) / 10,
        };
    }
    async calculateForMember(memberId, activityLevel, calorieGoal) {
        const member = await this.memberRepo.findOne({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        const bmr = this.calculateBMR(+member.weight, +member.height, member.age, member.gender);
        const tdee = this.calculateTDEE(bmr, activityLevel);
        const targetCalories = calorieGoal || tdee;
        const macros = this.calculateMacros(+member.weight, targetCalories);
        return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories: Math.round(targetCalories), ...macros };
    }
    async createPlan(memberId, activityLevel, calorieGoal, notes) {
        const calc = await this.calculateForMember(memberId, activityLevel, calorieGoal);
        await this.planRepo.update({ memberId, isActive: true }, { isActive: false });
        const plan = this.planRepo.create({
            memberId,
            activityLevel,
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