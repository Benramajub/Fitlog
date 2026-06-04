import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Session } from './session.entity';
import { Program } from './program.entity';
import { NutritionPlan } from './nutrition-plan.entity';
export declare enum Gender {
    MALE = "male",
    FEMALE = "female"
}
export declare enum PackageType {
    ONE_MONTH = "1_month",
    TWO_MONTHS = "2_months",
    FOUR_MONTHS = "4_months"
}
export declare const PACKAGE_SESSIONS: Record<PackageType, number>;
export declare class Member extends BaseEntity {
    user: User;
    userId: string;
    name: string;
    age: number;
    weight: number;
    height: number;
    gender: Gender;
    joinedAt: Date;
    expiresAt: Date;
    packageType: PackageType;
    totalSessions: number;
    usedSessions: number;
    goal?: string;
    notes?: string;
    avatarUrl?: string;
    sessions: Session[];
    programs: Program[];
    nutritionPlans: NutritionPlan[];
    get remainingSessions(): number;
}
