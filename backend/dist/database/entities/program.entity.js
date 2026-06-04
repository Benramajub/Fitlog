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
exports.ProgramDay = exports.Program = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const member_entity_1 = require("./member.entity");
const program_exercise_entity_1 = require("./program-exercise.entity");
let Program = class Program extends base_entity_1.BaseEntity {
};
exports.Program = Program;
__decorate([
    (0, typeorm_1.ManyToOne)(() => member_entity_1.Member, (m) => m.programs),
    (0, typeorm_1.JoinColumn)({ name: 'member_id' }),
    __metadata("design:type", member_entity_1.Member)
], Program.prototype, "member", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'member_id' }),
    __metadata("design:type", String)
], Program.prototype, "memberId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Program.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Program.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', default: true }),
    __metadata("design:type", Boolean)
], Program.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProgramDay, (d) => d.program, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], Program.prototype, "days", void 0);
exports.Program = Program = __decorate([
    (0, typeorm_1.Entity)('programs')
], Program);
let ProgramDay = class ProgramDay extends base_entity_1.BaseEntity {
};
exports.ProgramDay = ProgramDay;
__decorate([
    (0, typeorm_1.ManyToOne)(() => Program, (p) => p.days),
    (0, typeorm_1.JoinColumn)({ name: 'program_id' }),
    __metadata("design:type", Program)
], ProgramDay.prototype, "program", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'program_id' }),
    __metadata("design:type", String)
], ProgramDay.prototype, "programId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProgramDay.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_order', default: 1 }),
    __metadata("design:type", Number)
], ProgramDay.prototype, "dayOrder", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => program_exercise_entity_1.ProgramExercise, (e) => e.programDay, { cascade: true, eager: true }),
    __metadata("design:type", Array)
], ProgramDay.prototype, "exercises", void 0);
exports.ProgramDay = ProgramDay = __decorate([
    (0, typeorm_1.Entity)('program_days')
], ProgramDay);
//# sourceMappingURL=program.entity.js.map