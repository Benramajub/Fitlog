import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from '../sessions/sessions.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/guards/auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CalendarController {
  constructor(private readonly sessions: SessionsService) {}

  @Get()
  @Roles('admin')
  getCalendar(@Query('year') year: string, @Query('month') month: string) {
    return this.sessions.getCalendar(
      year ? +year : new Date().getFullYear(),
      month ? +month : new Date().getMonth() + 1,
    );
  }
}
