import { NutritionService } from './nutrition.service';
import { ActivityLevel } from '../database/entities/nutrition-plan.entity';
export declare class NutritionController {
    private readonly s;
    constructor(s: NutritionService);
    calculate(body: {
        memberId: string;
        activityLevel: ActivityLevel;
        calorieGoal?: number;
        macroMode?: 'lbm' | 'ratio';
        macroRatios?: {
            proteinPct: number;
            fatPct: number;
            carbPct: number;
        };
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
    createPlan(body: {
        memberId: string;
        activityLevel: ActivityLevel;
        calorieGoal?: number;
        notes?: string;
        macroMode?: 'lbm' | 'ratio';
        macroRatios?: {
            proteinPct: number;
            fatPct: number;
            carbPct: number;
        };
    }): Promise<import("../database/entities/nutrition-plan.entity").NutritionPlan>;
    getActivePlan(memberId: string): Promise<import("../database/entities/nutrition-plan.entity").NutritionPlan>;
    getChart(memberId: string, days?: string): Promise<{
        logs: any[];
        target: number;
        plan?: undefined;
    } | {
        logs: import("../database/entities/nutrition-plan.entity").DailyCalorieLog[];
        target: number;
        plan: import("../database/entities/nutrition-plan.entity").NutritionPlan;
    }>;
    upsertLog(planId: string, body: any): Promise<import("../database/entities/nutrition-plan.entity").DailyCalorieLog>;
    getLogs(memberId: string, from: string, to: string): Promise<import("../database/entities/nutrition-plan.entity").DailyCalorieLog[]>;
}
