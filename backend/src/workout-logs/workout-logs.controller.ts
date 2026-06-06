import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { WorkoutLogsService, WorkoutLogDto } from "./workout-logs.service";
import { JwtAuthGuard, RolesGuard, Roles } from "../common/guards/auth.guard";

@Controller("workout-logs")
@UseGuards(JwtAuthGuard)
export class WorkoutLogsController {
  constructor(private readonly s: WorkoutLogsService) {}

  @Get("session/:sessionId")
  getForSession(@Param("sessionId") id: string) {
    return this.s.getLogsForSession(id);
  }

  // Pre-fill from session's attached program
  @Get("session/:sessionId/prefilled")
  getPrefilled(@Param("sessionId") id: string) {
    return this.s.getPrefilled(id);
  }

  // Pre-fill from a specific program day
  @Get("prefilled-day/:dayId")
  getPrefilledFromDay(@Param("dayId") dayId: string) {
    return this.s.getPrefilledFromDay(dayId);
  }

  @Get("history/:memberId")
  getHistory(
    @Param("memberId") memberId: string,
    @Query("exercise") exercise?: string,
  ) {
    return this.s.getMemberHistory(memberId, exercise);
  }

  @Post("session/:sessionId")
  @Roles("admin")
  saveLog(@Param("sessionId") sessionId: string, @Body() dto: WorkoutLogDto) {
    return this.s.saveLog(sessionId, dto);
  }

  @Post("session/:sessionId/bulk")
  @Roles("admin")
  saveBulk(
    @Param("sessionId") sessionId: string,
    @Body() body: { logs: WorkoutLogDto[] },
  ) {
    return this.s.saveBulk(sessionId, body.logs);
  }

  @Patch(":id")
  @Roles("admin")
  update(@Param("id") id: string, @Body() dto: Partial<WorkoutLogDto>) {
    return this.s.updateLog(id, dto);
  }

  @Delete(":id")
  @Roles("admin")
  remove(@Param("id") id: string) {
    return this.s.deleteLog(id);
  }
}
