import { Repository } from 'typeorm';
import { NutritionPlan, DailyCalorieLog, ActivityLevel } from '../database/entities/nutrition-plan.entity';
import { Member } from '../database/entities/member.entity';
import { Gender } from '../database/entities/member.entity';
export declare class NutritionService {
    private planRepo;
    private logRepo;
    private memberRepo;
    constructor(planRepo: Repository<NutritionPlan>, logRepo: Repository<DailyCalorieLog>, memberRepo: Repository<Member>);
    calculateBMR(weight: number, height: number, age: number, gender: Gender): number;
    calculateTDEE(bmr: number, activity: ActivityLevel): number;
    calculateMacros(weight: number, tdee: number): {
        proteinG: number;
        fatG: number;
        carbG: number;
    };
    calculateForMember(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number): Promise<{
        proteinG: number;
        fatG: number;
        carbG: number;
        bmr: number;
        tdee: number;
        targetCalories: number;
    }>;
    createPlan(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number, notes?: string): Promise<NutritionPlan>;
    getActivePlan(memberId: string): Promise<NutritionPlan>;
    upsertDailyLog(nutritionPlanId: string, logDate: string, data: {
        caloriesConsumed: number;
        proteinG: number;
        fatG: number;
        carbG: number;
        notes?: string;
    }): Promise<DailyCalorieLog>;
    getDailyLogs(memberId: string, fromDate: string, toDate: string): Promise<DailyCalorieLog[]>;
    getCalorieChart(memberId: string, days?: number): Promise<{
        logs: any[];
        target: number;
        plan?: undefined;
    } | {
        logs: DailyCalorieLog[];
        target: number;
        plan: NutritionPlan;
    }>;
}
