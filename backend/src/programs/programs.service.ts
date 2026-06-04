import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program, ProgramDay } from '../database/entities/program.entity';
import { ProgramExercise } from '../database/entities/program-exercise.entity';

@Injectable()
export class ProgramsService {
  constructor(
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(ProgramDay) private dayRepo: Repository<ProgramDay>,
    @InjectRepository(ProgramExercise) private exRepo: Repository<ProgramExercise>,
  ) {}

  findByMember(memberId: string) {
    return this.programRepo.find({
      where: { memberId },
      relations: ['days', 'days.exercises'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const p = await this.programRepo.findOne({
      where: { id },
      relations: ['days', 'days.exercises'],
    });
    if (!p) throw new NotFoundException();
    return p;
  }

  async create(memberId: string, data: { name: string; description?: string; days: Array<{ title: string; dayOrder?: number; exercises: Partial<ProgramExercise>[] }> }) {
    const program = this.programRepo.create({ memberId, name: data.name, description: data.description });
    const saved = await this.programRepo.save(program);

    for (const d of data.days) {
      const day = this.dayRepo.create({ programId: saved.id, title: d.title, dayOrder: d.dayOrder || 1 });
      const savedDay = await this.dayRepo.save(day);
      for (const [i, ex] of d.exercises.entries()) {
        await this.exRepo.save(this.exRepo.create({ ...ex, programDayId: savedDay.id, sortOrder: i }));
      }
    }
    return this.findOne(saved.id);
  }

  async addDay(programId: string, title: string, dayOrder: number) {
    const day = this.dayRepo.create({ programId, title, dayOrder });
    return this.dayRepo.save(day);
  }

  async updateDay(dayId: string, title: string) {
    await this.dayRepo.update(dayId, { title });
    return this.dayRepo.findOne({ where: { id: dayId }, relations: ['exercises'] });
  }

  async addExercise(programDayId: string, data: Partial<ProgramExercise>) {
    const ex = this.exRepo.create({ ...data, programDayId });
    return this.exRepo.save(ex);
  }

  async updateExercise(id: string, data: Partial<ProgramExercise>) {
    await this.exRepo.update(id, data);
    return this.exRepo.findOne({ where: { id } });
  }

  async removeExercise(id: string) {
    await this.exRepo.delete(id);
    return { success: true };
  }

  async remove(id: string) {
    await this.programRepo.softDelete(id);
    return { success: true };
  }
}
