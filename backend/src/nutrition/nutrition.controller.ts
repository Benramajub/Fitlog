import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { ActivityLevel } from '../database/entities/nutrition-plan.entity';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/guards/auth.guard';

@Controller('nutrition')
@UseGuards(JwtAuthGuard)
export class NutritionController {
  constructor(private readonly s: NutritionService) {}

  @Post('calculate')
  @Roles('admin')
  calculate(@Body() body: { memberId: string; activityLevel: ActivityLevel; calorieGoal?: number }) {
    return this.s.calculateForMember(body.memberId, body.activityLevel, body.calorieGoal);
  }

  @Post('plans')
  @Roles('admin')
  createPlan(@Body() body: { memberId: string; activityLevel: ActivityLevel; calorieGoal?: number; notes?: string }) {
    return this.s.createPlan(body.memberId, body.activityLevel, body.calorieGoal, body.notes);
  }

  @Get('plans/member/:memberId')
  getActivePlan(@Param('memberId') memberId: string) { return this.s.getActivePlan(memberId); }

  @Get('chart/:memberId')
  getChart(@Param('memberId') memberId: string, @Query('days') days?: string) {
    return this.s.getCalorieChart(memberId, days ? +days : 30);
  }

  @Post('plans/:planId/logs')
  @Roles('admin')
  upsertLog(@Param('planId') planId: string, @Body() body: any) {
    return this.s.upsertDailyLog(planId, body.logDate, body);
  }

  @Get('logs/:memberId')
  getLogs(@Param('memberId') memberId: string, @Query('from') from: string, @Query('to') to: string) {
    return this.s.getDailyLogs(memberId, from, to);
  }
}
