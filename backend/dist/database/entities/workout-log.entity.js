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
exports.WorkoutLog = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const session_entity_1 = require("./session.entity");
let WorkoutLog = class WorkoutLog extends base_entity_1.BaseEntity {
};
exports.WorkoutLog = WorkoutLog;
__decorate([
    (0, typeorm_1.ManyToOne)(() => session_entity_1.Session, (s) => s.workoutLogs),
    (0, typeorm_1.JoinColumn)({ name: 'session_id' }),
    __metadata("design:type", session_entity_1.Session)
], WorkoutLog.prototype, "session", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'session_id' }),
    __metadata("design:type", String)
], WorkoutLog.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'day_title', nullable: true }),
    __metadata("design:type", String)
], WorkoutLog.prototype, "dayTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exercise_name' }),
    __metadata("design:type", String)
], WorkoutLog.prototype, "exerciseName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 6, scale: 2 }),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "sets", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "reps", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 8, scale: 2, name: 'volume_kg' }),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "volumeKg", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "rir", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 3, scale: 1, nullable: true }),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "rpe", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], WorkoutLog.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sort_order', default: 0 }),
    __metadata("design:type", Number)
], WorkoutLog.prototype, "sortOrder", void 0);
exports.WorkoutLog = WorkoutLog = __decorate([
    (0, typeorm_1.Entity)('workout_logs')
], WorkoutLog);
//# sourceMappingURL=workout-log.entity.js.map