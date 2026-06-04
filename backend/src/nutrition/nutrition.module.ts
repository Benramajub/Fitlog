// nutrition.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NutritionPlan, DailyCalorieLog } from '../database/entities/nutrition-plan.entity';
import { Member } from '../database/entities/member.entity';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';

@Module({
  imports: [TypeOrmModule.forFeature([NutritionPlan, DailyCalorieLog, Member])],
  controllers: [NutritionController],
  providers: [NutritionService],
  exports: [NutritionService],
})
export class NutritionModule {}
