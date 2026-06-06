"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutLogsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const workout_log_entity_1 = require("../database/entities/workout-log.entity");
const session_entity_1 = require("../database/entities/session.entity");
const program_entity_1 = require("../database/entities/program.entity");
let WorkoutLogsService = class WorkoutLogsService {
    constructor(logRepo, sessionRepo, dayRepo, programRepo) {
        this.logRepo = logRepo;
        this.sessionRepo = sessionRepo;
        this.dayRepo = dayRepo;
        this.programRepo = programRepo;
    }
    async getLogsForSession(sessionId) {
        return this.logRepo.find({
            where: { sessionId },
            order: { sortOrder: "ASC", createdAt: "ASC" },
        });
    }
    async getPrefilled(sessionId) {
        const session = await this.sessionRepo.findOne({
            where: { id: sessionId },
            relations: ["program", "program.days", "program.days.exercises"],
        });
        if (!session?.program)
            return [];
        const prefilled = [];
        for (const day of session.program.days.sort((a, b) => a.dayOrder - b.dayOrder)) {
            for (const ex of day.exercises.sort((a, b) => a.sortOrder - b.sortOrder)) {
                prefilled.push({
                    dayTitle: day.title,
                    exerciseName: ex.exerciseName,
                    weight: ex.defaultWeight || 0,
                    sets: ex.defaultSets || 1,
                    reps: ex.defaultReps || 10,
                    volumeKg: (ex.defaultWeight || 0) *
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
    async getPrefilledFromDay(dayId) {
        const day = await this.dayRepo.findOne({
            where: { id: dayId },
            relations: ["exercises"],
        });
        if (!day)
            throw new common_1.NotFoundException("Program day not found");
        return day.exercises
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((ex) => ({
            dayTitle: day.title,
            exerciseName: ex.exerciseName,
            weight: ex.defaultWeight || 0,
            sets: ex.defaultSets || 1,
            reps: ex.defaultReps || 10,
            volumeKg: (ex.defaultWeight || 0) *
                (ex.defaultSets || 1) *
                (ex.defaultReps || 10),
            rir: ex.defaultRir,
            rpe: ex.defaultRpe,
            notes: ex.notes,
            sortOrder: ex.sortOrder,
        }));
    }
    async saveLog(sessionId, dto) {
        const volumeKg = dto.weight * dto.sets * dto.reps;
        const log = this.logRepo.create({ ...dto, sessionId, volumeKg });
        return this.logRepo.save(log);
    }
    async saveBulk(sessionId, dtos) {
        await this.logRepo.delete({ sessionId });
        if (!dtos.length)
            return [];
        const logs = dtos.map((dto, i) => this.logRepo.create({
            ...dto,
            sessionId,
            volumeKg: dto.weight * dto.sets * dto.reps,
            sortOrder: dto.sortOrder ?? i,
        }));
        return this.logRepo.save(logs);
    }
    async updateLog(id, dto) {
        const log = await this.logRepo.findOne({ where: { id } });
        if (!log)
            throw new common_1.NotFoundException();
        Object.assign(log, dto);
        log.volumeKg = log.weight * log.sets * log.reps;
        return this.logRepo.save(log);
    }
    async deleteLog(id) {
        await this.logRepo.delete(id);
        return { success: true };
    }
    async getMemberHistory(memberId, exerciseName) {
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
};
exports.WorkoutLogsService = WorkoutLogsService;
exports.WorkoutLogsService = WorkoutLogsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(workout_log_entity_1.WorkoutLog)),
    __param(1, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(2, (0, typeorm_1.InjectRepository)(program_entity_1.ProgramDay)),
    __param(3, (0, typeorm_1.InjectRepository)(program_entity_1.Program)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WorkoutLogsService);
//# sourceMappingURL=workout-logs.service.js.map