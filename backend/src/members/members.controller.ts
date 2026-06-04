import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { MembersService, CreateMemberDto, UpdateMemberDto } from './members.service';
import { JwtAuthGuard } from '../common/guards/auth.guard';
import { RolesGuard, Roles } from '../common/guards/auth.guard';

@Controller('members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  @Roles('admin')
  findAll() { return this.membersService.findAll(); }

  // NOTE: /stats ต้องอยู่ก่อน /:id เสมอ ไม่งั้น nestjs จะ match "stats" เป็น id
  @Get(':id/stats')
  getStats(@Param('id') id: string) { return this.membersService.getStats(id); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.membersService.findOne(id); }

  @Post()
  @Roles('admin')
  create(@Body() dto: CreateMemberDto) {
    console.log('[MembersController] create dto:', JSON.stringify(dto));
    return this.membersService.create(dto);
  }

  @Patch(':id')
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) { return this.membersService.remove(id); }
}