import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WorkoutLog } from "../database/entities/workout-log.entity";
import { Session } from "../database/entities/session.entity";
import { ProgramDay } from "../database/entities/program.entity";
import { Program } from "../database/entities/program.entity";
import { WorkoutLogsController } from "./workout-logs.controller";
import { WorkoutLogsService } from "./workout-logs.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([WorkoutLog, Session, ProgramDay, Program]),
  ],
  controllers: [WorkoutLogsController],
  providers: [WorkoutLogsService],
  exports: [WorkoutLogsService],
})
export class WorkoutLogsModule {}
