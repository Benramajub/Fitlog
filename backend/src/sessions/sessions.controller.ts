import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/guards/auth.guard';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @Roles('admin')
  findAll(@Query('memberId') memberId?: string, @Query('date') date?: string) {
    return this.sessionsService.findAll({ memberId, date });
  }

  @Get('calendar')
  @Roles('admin')
  getCalendar(@Query('year') year: string, @Query('month') month: string) {
    return this.sessionsService.getCalendar(+year, +month);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.sessionsService.findOne(id); }

  @Post('schedule')
  @Roles('admin')
  schedule(@Body() body: { memberId: string; scheduledAt: string; programId?: string; notes?: string }) {
    return this.sessionsService.schedule(body.memberId, body.scheduledAt, body.programId, body.notes);
  }

  @Patch(':id/start')
  @Roles('admin')
  start(@Param('id') id: string) { return this.sessionsService.startSession(id); }

  @Patch(':id/end')
  @Roles('admin')
  end(@Param('id') id: string, @Body() body: { notes?: string }) {
    return this.sessionsService.endSession(id, body.notes);
  }

  @Patch(':id/cancel')
  @Roles('admin')
  cancel(@Param('id') id: string) { return this.sessionsService.cancel(id); }
}
