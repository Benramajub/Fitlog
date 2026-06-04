import { Controller, Get, Post, Patch, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../common/guards/auth.guard';

@Controller('programs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgramsController {
  constructor(private readonly s: ProgramsService) {}

  @Get()
  @Roles('admin')
  findByMember(@Query('memberId') memberId: string) { return this.s.findByMember(memberId); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.s.findOne(id); }

  @Post()
  @Roles('admin')
  create(@Body() body: any) { return this.s.create(body.memberId, body); }

  @Post(':id/days')
  @Roles('admin')
  addDay(@Param('id') id: string, @Body() body: { title: string; dayOrder?: number }) {
    return this.s.addDay(id, body.title, body.dayOrder || 1);
  }

  @Patch('days/:dayId')
  @Roles('admin')
  updateDay(@Param('dayId') dayId: string, @Body() body: { title: string }) {
    return this.s.updateDay(dayId, body.title);
  }

  @Post('days/:dayId/exercises')
  @Roles('admin')
  addExercise(@Param('dayId') dayId: string, @Body() body: any) {
    return this.s.addExercise(dayId, body);
  }

  @Patch('exercises/:exId')
  @Roles('admin')
  updateExercise(@Param('exId') exId: string, @Body() body: any) {
    return this.s.updateExercise(exId, body);
  }

  @Delete('exercises/:exId')
  @Roles('admin')
  removeExercise(@Param('exId') exId: string) { return this.s.removeExercise(exId); }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.s.remove(id); }
}
