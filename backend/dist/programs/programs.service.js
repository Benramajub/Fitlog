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
exports.ProgramsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const program_entity_1 = require("../database/entities/program.entity");
const program_exercise_entity_1 = require("../database/entities/program-exercise.entity");
let ProgramsService = class ProgramsService {
    constructor(programRepo, dayRepo, exRepo) {
        this.programRepo = programRepo;
        this.dayRepo = dayRepo;
        this.exRepo = exRepo;
    }
    findByMember(memberId) {
        return this.programRepo.find({
            where: { memberId },
            relations: ['days', 'days.exercises'],
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const p = await this.programRepo.findOne({
            where: { id },
            relations: ['days', 'days.exercises'],
        });
        if (!p)
            throw new common_1.NotFoundException();
        return p;
    }
    async create(memberId, data) {
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
    async addDay(programId, title, dayOrder) {
        const day = this.dayRepo.create({ programId, title, dayOrder });
        return this.dayRepo.save(day);
    }
    async updateDay(dayId, title) {
        await this.dayRepo.update(dayId, { title });
        return this.dayRepo.findOne({ where: { id: dayId }, relations: ['exercises'] });
    }
    async addExercise(programDayId, data) {
        const ex = this.exRepo.create({ ...data, programDayId });
        return this.exRepo.save(ex);
    }
    async updateExercise(id, data) {
        await this.exRepo.update(id, data);
        return this.exRepo.findOne({ where: { id } });
    }
    async removeExercise(id) {
        await this.exRepo.delete(id);
        return { success: true };
    }
    async remove(id) {
        await this.programRepo.softDelete(id);
        return { success: true };
    }
};
exports.ProgramsService = ProgramsService;
exports.ProgramsService = ProgramsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(program_entity_1.Program)),
    __param(1, (0, typeorm_1.InjectRepository)(program_entity_1.ProgramDay)),
    __param(2, (0, typeorm_1.InjectRepository)(program_exercise_entity_1.ProgramExercise)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ProgramsService);
//# sourceMappingURL=programs.service.js.map