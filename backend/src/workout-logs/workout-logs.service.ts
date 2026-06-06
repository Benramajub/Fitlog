import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { WorkoutLog } from "../database/entities/workout-log.entity";
import { Session } from "../database/entities/session.entity";
import { ProgramDay, Program } from "../database/entities/program.entity";

export interface WorkoutLogDto {
  dayTitle?: string;
  exerciseName: string;
  weight: number;
  sets: number;
  reps: number;
  rir?: number;
  rpe?: number;
  notes?: string;
  sortOrder?: number;
}

@Injectable()
export class WorkoutLogsService {
  constructor(
    @InjectRepository(WorkoutLog) private logRepo: Repository<WorkoutLog>,
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(ProgramDay) private dayRepo: Repository<ProgramDay>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
  ) {}

  async getLogsForSession(sessionId: string) {
    return this.logRepo.find({
      where: { sessionId },
      order: { sortOrder: "ASC", createdAt: "ASC" },
    });
  }

  // Pre-fill from session's attached program
  async getPrefilled(sessionId: string) {
    const session = await this.sessionRepo.findOne({
      where: { id: sessionId },
      relations: ["program", "program.days", "program.days.exercises"],
    });
    if (!session?.program) return [];

    const prefilled: Partial<WorkoutLog>[] = [];
    for (const day of session.program.days.sort(
      (a, b) => a.dayOrder - b.dayOrder,
    )) {
      for (const ex of day.exercises.sort(
        (a, b) => a.sortOrder - b.sortOrder,
      )) {
        prefilled.push({
          dayTitle: day.title,
          exerciseName: ex.exerciseName,
          weight: ex.defaultWeight || 0,
          sets: ex.defaultSets || 1,
          reps: ex.defaultReps || 10,
          volumeKg:
            (ex.defaultWeight || 0) *
            (ex.defaultSets || 1) *
            (ex.defaultReps || 10),
          rir: ex.defaultRir,
          rpe: ex.defaultRpe,
          notes: ex.notes,
          sortOrder: ex.sortOrder,
        });
      }
    }
    return prefilled;
  }

  // Pre-fill from a specific program day (called by frontend picker)
  async getPrefilledFromDay(dayId: string) {
    const day = await this.dayRepo.findOne({
      where: { id: dayId },
      relations: ["exercises"],
    });
    if (!day) throw new NotFoundException("Program day not found");

    return day.exercises
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((ex) => ({
        dayTitle: day.title,
        exerciseName: ex.exerciseName,
        weight: ex.defaultWeight || 0,
        sets: ex.defaultSets || 1,
        reps: ex.defaultReps || 10,
        volumeKg:
          (ex.defaultWeight || 0) *
          (ex.defaultSets || 1) *
          (ex.defaultReps || 10),
        rir: ex.defaultRir,
        rpe: ex.defaultRpe,
        notes: ex.notes,
        sortOrder: ex.sortOrder,
      }));
  }

  async saveLog(sessionId: string, dto: WorkoutLogDto) {
    const volumeKg = dto.weight * dto.sets * dto.reps;
    const log = this.logRepo.create({ ...dto, sessionId, volumeKg });
    return this.logRepo.save(log);
  }

  async saveBulk(sessionId: string, dtos: WorkoutLogDto[]) {
    // Delete old logs first — prevent duplicates on re-save
    await this.logRepo.delete({ sessionId });
    if (!dtos.length) return [];

    const logs = dtos.map((dto, i) =>
      this.logRepo.create({
        ...dto,
        sessionId,
        volumeKg: dto.weight * dto.sets * dto.reps,
        sortOrder: dto.sortOrder ?? i,
      }),
    );
    return this.logRepo.save(logs);
  }

  async updateLog(id: string, dto: Partial<WorkoutLogDto>) {
    const log = await this.logRepo.findOne({ where: { id } });
    if (!log) throw new NotFoundException();
    Object.assign(log, dto);
    log.volumeKg = log.weight * log.sets * log.reps;
    return this.logRepo.save(log);
  }

  async deleteLog(id: string) {
    await this.logRepo.delete(id);
    return { success: true };
  }

  async getMemberHistory(memberId: string, exerciseName?: string) {
    const qb = this.logRepo
      .createQueryBuilder("l")
      .leftJoin("l.session", "s")
      .where("s.memberId = :memberId", { memberId })
      .andWhere("s.status = :status", { status: "completed" })
      .orderBy("s.startedAt", "DESC")
      .take(100);

    if (exerciseName)
      qb.andWhere("l.exerciseName ILIKE :name", { name: `%${exerciseName}%` });
    return qb.getMany();
  }
}
