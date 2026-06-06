import { Repository } from 'typeorm';
import { NutritionPlan, DailyCalorieLog, ActivityLevel } from '../database/entities/nutrition-plan.entity';
import { Member } from '../database/entities/member.entity';
import { Gender } from '../database/entities/member.entity';
export declare class NutritionService {
    private planRepo;
    private logRepo;
    private memberRepo;
    constructor(planRepo: Repository<NutritionPlan>, logRepo: Repository<DailyCalorieLog>, memberRepo: Repository<Member>);
    calculateLBM(weight: number, height: number, gender: Gender): number;
    calculateBMR(weight: number, height: number, age: number, gender: Gender): number;
    calculateTDEE(bmr: number, activity: ActivityLevel): number;
    calculateMacros(lbm: number, tdee: number, mode?: 'lbm' | 'ratio', ratios?: {
        proteinPct: number;
        fatPct: number;
        carbPct: number;
    }): {
        proteinG: number;
        fatG: number;
        carbG: number;
    };
    calculateForMember(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number, macroMode?: 'lbm' | 'ratio', macroRatios?: {
        proteinPct: number;
        fatPct: number;
        carbPct: number;
    }): Promise<{
        proteinPct: number;
        fatPct: number;
        carbPct: number;
        proteinG: number;
        fatG: number;
        carbG: number;
        lbm: number;
        bmr: number;
        tdee: number;
        targetCalories: number;
        macroMode: "lbm" | "ratio";
    }>;
    createPlan(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number, notes?: string, macroMode?: 'lbm' | 'ratio', macroRatios?: {
        proteinPct: number;
        fatPct: number;
        carbPct: number;
    }): Promise<NutritionPlan>;
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
