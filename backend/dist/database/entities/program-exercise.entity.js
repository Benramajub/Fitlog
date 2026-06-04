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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramExercise = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const program_entity_1 = require("./program.entity");
let ProgramExercise = class ProgramExercise extends base_entity_1.BaseEntity {
};
exports.ProgramExercise = ProgramExercise;
__decorate([
    (0, typeorm_1.ManyToOne)(() => program_entity_1.ProgramDay, (d) => d.exercises),
    (0, typeorm_1.JoinColumn)({ name: 'program_day_id' }),
    __metadata("design:type", program_entity_1.ProgramDay)
], ProgramExercise.prototype, "programDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'program_day_id' }),
    __metadata("design:type", String)
], ProgramExercise.prototype, "programDayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_name' }),
    __metadata("design:type", String)
], ProgramExercise.prototype, "exerciseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_weight', type: 'decimal', precision: 6, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "defaultWeight", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_sets', nullable: true }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "defaultSets", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_reps', nullable: true }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "defaultReps", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_rir', nullable: true }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "defaultRir", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'default_rpe', type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "defaultRpe", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProgramExercise.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], ProgramExercise.prototype, "sortOrder", void 0);
exports.ProgramExercise = ProgramExercise = __decorate([
    (0, typeorm_1.Entity)('program_exercises')
], ProgramExercise);
//# sourceMappingURL=program-exercise.entity.js.map