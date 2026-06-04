import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs'
import { NutritionPlan, DailyCalorieLog, ActivityLevel, ACTIVITY_MULTIPLIER } from '../database/entities/nutrition-plan.entity';
import { Member } from '../database/entities/member.entity';
import { Gender } from '../database/entities/member.entity';

@Injectable()
export class NutritionService {
  constructor(
    @InjectRepository(NutritionPlan) private planRepo: Repository<NutritionPlan>,
    @InjectRepository(DailyCalorieLog) private logRepo: Repository<DailyCalorieLog>,
    @InjectRepository(Member) private memberRepo: Repository<Member>,
  ) {}

  // ─── Core calculation ───────────────────────────────────────────
  calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    if (gender === Gender.MALE) {
      return 66 + 13.7 * weight + 5 * height - 6.8 * age;
    }
    return 665 + 9.6 * weight + 1.8 * height - 4.7 * age;
  }

  calculateTDEE(bmr: number, activity: ActivityLevel): number {
    return bmr * ACTIVITY_MULTIPLIER[activity];
  }

  calculateMacros(weight: number, tdee: number) {
    const protein = weight * 1.6; // g  (protein = weight * 1.6)
    const fat = (tdee * 0.25) / 9; // g  (25% calories / 9 kcal per g)
    const proteinCal = protein * 4;
    const fatCal = fat * 9;
    const carbCal = tdee - proteinCal - fatCal;
    const carb = carbCal / 4; // g
    return {
      proteinG: Math.round(protein * 10) / 10,
      fatG: Math.round(fat * 10) / 10,
      carbG: Math.round(carb * 10) / 10,
    };
  }

  // ─── Plan CRUD ──────────────────────────────────────────────────
  async calculateForMember(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const bmr = this.calculateBMR(+member.weight, +member.height, member.age, member.gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const targetCalories = calorieGoal || tdee;
    const macros = this.calculateMacros(+member.weight, targetCalories);

    return { bmr: Math.round(bmr), tdee: Math.round(tdee), targetCalories: Math.round(targetCalories), ...macros };
  }

  async createPlan(memberId: string, activityLevel: ActivityLevel, calorieGoal?: number, notes?: string) {
    const calc = await this.calculateForMember(memberId, activityLevel, calorieGoal);

    // Deactivate previous plans
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

  async getActivePlan(memberId: string) {
    return this.planRepo.findOne({
      where: { memberId, isActive: true },
      relations: ['dailyLogs'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Daily logs ─────────────────────────────────────────────────
  async upsertDailyLog(nutritionPlanId: string, logDate: string, data: {
    caloriesConsumed: number;
    proteinG: number;
    fatG: number;
    carbG: number;
    notes?: string;
  }) {
    let log = await this.logRepo.findOne({ where: { nutritionPlanId, logDate: new Date(logDate) as any } });
    if (!log) {
      log = this.logRepo.create({ nutritionPlanId, logDate: new Date(logDate) as any });
    }
    Object.assign(log, data);
    return this.logRepo.save(log);
  }

  async getDailyLogs(memberId: string, fromDate: string, toDate: string) {
    const plan = await this.getActivePlan(memberId);
    if (!plan) return [];

    return this.logRepo
      .createQueryBuilder('l')
      .where('l.nutritionPlanId = :pid', { pid: plan.id })
      .andWhere('l.logDate BETWEEN :from AND :to', { from: fromDate, to: toDate })
      .orderBy('l.logDate', 'ASC')
      .getMany();
  }

  async getCalorieChart(memberId: string, days = 30) {
    const from = dayjs().subtract(days, 'day').format('YYYY-MM-DD');
    const to = dayjs().format('YYYY-MM-DD');
    const plan = await this.getActivePlan(memberId);
    if (!plan) return { logs: [], target: 0 };

    const logs = await this.getDailyLogs(memberId, from, to);
    return {
      logs,
      target: plan.targetCalories,
      plan,
    };
  }
}
