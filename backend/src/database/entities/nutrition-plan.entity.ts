import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';

export enum ActivityLevel {
  SEDENTARY = 'sedentary',         // x1.2
  LIGHT = 'light',                 // x1.375
  MODERATE = 'moderate',           // x1.55
  HEAVY = 'heavy',                 // x1.725
  VERY_HEAVY = 'very_heavy',       // x1.9
}

export const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.HEAVY]: 1.725,
  [ActivityLevel.VERY_HEAVY]: 1.9,
};

@Entity('nutrition_plans')
export class NutritionPlan extends BaseEntity {
  @ManyToOne(() => Member, (m) => m.nutritionPlans)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column({ name: 'activity_level', type: 'enum', enum: ActivityLevel })
  activityLevel: ActivityLevel;

  // Calculated values (stored for history)
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  lbm: number; // Lean Body Mass (kg) — Boer Formula

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  bmr: number; // Katch-McArdle BMR from LBM

  @Column({ type: 'decimal', precision: 7, scale: 2 })
  tdee: number;

  @Column({ name: 'target_calories', type: 'decimal', precision: 7, scale: 2 })
  targetCalories: number;

  @Column({ name: 'protein_g', type: 'decimal', precision: 6, scale: 2 })
  proteinG: number;

  @Column({ name: 'fat_g', type: 'decimal', precision: 6, scale: 2 })
  fatG: number;

  @Column({ name: 'carb_g', type: 'decimal', precision: 6, scale: 2 })
  carbG: number;

  @Column({ name: 'calorie_goal', type: 'decimal', precision: 7, scale: 2, nullable: true })
  calorieGoal?: number; // custom override if needed

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ nullable: true })
  notes?: string;

  @OneToMany(() => DailyCalorieLog, (d) => d.nutritionPlan, { cascade: true })
  dailyLogs: DailyCalorieLog[];
}

@Entity('daily_calorie_logs')
export class DailyCalorieLog extends BaseEntity {
  @ManyToOne(() => NutritionPlan, (n) => n.dailyLogs)
  @JoinColumn({ name: 'nutrition_plan_id' })
  nutritionPlan: NutritionPlan;

  @Column({ name: 'nutrition_plan_id' })
  nutritionPlanId: string;

  @Column({ name: 'log_date', type: 'date' })
  logDate: Date;

  @Column({ name: 'calories_consumed', type: 'decimal', precision: 7, scale: 2, default: 0 })
  caloriesConsumed: number;

  @Column({ name: 'protein_g', type: 'decimal', precision: 6, scale: 2, default: 0 })
  proteinG: number;

  @Column({ name: 'fat_g', type: 'decimal', precision: 6, scale: 2, default: 0 })
  fatG: number;

  @Column({ name: 'carb_g', type: 'decimal', precision: 6, scale: 2, default: 0 })
  carbG: number;

  @Column({ nullable: true })
  notes?: string;
}