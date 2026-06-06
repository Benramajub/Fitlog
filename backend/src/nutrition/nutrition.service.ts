import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
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

  /**
   * Lean Body Mass (Boer Formula)
   * ชาย:  LBM = (0.407 × weight) + (0.267 × height) − 19.2
   * หญิง: LBM = (0.252 × weight) + (0.473 × height) − 48.3
   * weight: kg, height: cm → LBM: kg
   */
  calculateLBM(weight: number, height: number, gender: Gender): number {
    if (gender === Gender.MALE) {
      return 0.407 * weight + 0.267 * height - 19.2;
    }
    return 0.252 * weight + 0.473 * height - 48.3;
  }

  /**
   * BMR จาก Lean Body Mass (Katch-McArdle Formula)
   * BMR = 370 + (21.6 × LBM)
   * แม่นยำกว่า Harris-Benedict เพราะไม่ขึ้นกับ gender โดยตรง
   */
  calculateBMR(weight: number, height: number, age: number, gender: Gender): number {
    const lbm = this.calculateLBM(weight, height, gender);
    return 370 + 21.6 * lbm;
  }

  calculateTDEE(bmr: number, activity: ActivityLevel): number {
    return bmr * ACTIVITY_MULTIPLIER[activity];
  }

  /**
   * Macro ratio mode:
   *  'lbm'   — โปรตีน = LBM×1.6, ไขมัน = 25% tdee, คาร์บ = ที่เหลือ (default)
   *  'ratio' — คำนวณจาก % ที่กำหนด (proteinPct + fatPct + carbPct = 100)
   */
  calculateMacros(
    lbm: number,
    tdee: number,
    mode: 'lbm' | 'ratio' = 'lbm',
    ratios?: { proteinPct: number; fatPct: number; carbPct: number },
  ) {
    let protein: number, fat: number, carb: number;

    if (mode === 'ratio' && ratios) {
      protein = (tdee * (ratios.proteinPct / 100)) / 4;
      fat     = (tdee * (ratios.fatPct / 100)) / 9;
      carb    = (tdee * (ratios.carbPct / 100)) / 4;
    } else {
      // Default: LBM-based protein, 25% fat, remaining carb
      protein = lbm * 1.6;
      fat     = (tdee * 0.25) / 9;
      carb    = (tdee - protein * 4 - fat * 9) / 4;
    }

    return {
      proteinG: Math.round(protein * 10) / 10,
      fatG:     Math.round(fat * 10) / 10,
      carbG:    Math.round(Math.max(0, carb) * 10) / 10,
    };
  }

  // ─── Plan CRUD ──────────────────────────────────────────────────
  async calculateForMember(
    memberId: string,
    activityLevel: ActivityLevel,
    calorieGoal?: number,
    macroMode: 'lbm' | 'ratio' = 'lbm',
    macroRatios?: { proteinPct: number; fatPct: number; carbPct: number },
  ) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    const lbm  = this.calculateLBM(+member.weight, +member.height, member.gender);
    const bmr  = this.calculateBMR(+member.weight, +member.height, member.age, member.gender);
    const tdee = this.calculateTDEE(bmr, activityLevel);
    const targetCalories = calorieGoal || tdee;
    const macros = this.calculateMacros(lbm, targetCalories, macroMode, macroRatios);

    // Calc effective % from result (for display)
    const proteinPct = Math.round((macros.proteinG * 4 / targetCalories) * 100);
    const fatPct     = Math.round((macros.fatG * 9 / targetCalories) * 100);
    const carbPct    = Math.round((macros.carbG * 4 / targetCalories) * 100);

    return {
      lbm:            Math.round(lbm * 10) / 10,
      bmr:            Math.round(bmr),
      tdee:           Math.round(tdee),
      targetCalories: Math.round(targetCalories),
      macroMode,
      ...macros,
      proteinPct, fatPct, carbPct,
    };
  }

  async createPlan(
    memberId: string,
    activityLevel: ActivityLevel,
    calorieGoal?: number,
    notes?: string,
    macroMode: 'lbm' | 'ratio' = 'lbm',
    macroRatios?: { proteinPct: number; fatPct: number; carbPct: number },
  ) {
    const calc = await this.calculateForMember(memberId, activityLevel, calorieGoal, macroMode, macroRatios);

    // Deactivate previous plans
    await this.planRepo.update({ memberId, isActive: true }, { isActive: false });

    const plan = this.planRepo.create({
      memberId,
      activityLevel,
      lbm:            calc.lbm,
      bmr:            calc.bmr,
      tdee:           calc.tdee,
      targetCalories: calc.targetCalories,
      proteinG:       calc.proteinG,
      fatG:           calc.fatG,
      carbG:          calc.carbG,
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