import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
export declare enum ActivityLevel {
    SEDENTARY = "sedentary",
    LIGHT = "light",
    MODERATE = "moderate",
    HEAVY = "heavy",
    VERY_HEAVY = "very_heavy"
}
export declare const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number>;
export declare class NutritionPlan extends BaseEntity {
    member: Member;
    memberId: string;
    activityLevel: ActivityLevel;
    lbm: number;
    bmr: number;
    tdee: number;
    targetCalories: number;
    proteinG: number;
    fatG: number;
    carbG: number;
    calorieGoal?: number;
    isActive: boolean;
    notes?: string;
    dailyLogs: DailyCalorieLog[];
}
export declare class DailyCalorieLog extends BaseEntity {
    nutritionPlan: NutritionPlan;
    nutritionPlanId: string;
    logDate: Date;
    caloriesConsumed: number;
    proteinG: number;
    fatG: number;
    carbG: number;
    notes?: string;
}
