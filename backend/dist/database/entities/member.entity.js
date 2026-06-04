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
exports.Member = exports.PACKAGE_SESSIONS = exports.PackageType = exports.Gender = void 0;
const typeorm_1 = require("typeorm");
const base_entity_1 = require("./base.entity");
const user_entity_1 = require("./user.entity");
const session_entity_1 = require("./session.entity");
const program_entity_1 = require("./program.entity");
const nutrition_plan_entity_1 = require("./nutrition-plan.entity");
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
var PackageType;
(function (PackageType) {
    PackageType["ONE_MONTH"] = "1_month";
    PackageType["TWO_MONTHS"] = "2_months";
    PackageType["FOUR_MONTHS"] = "4_months";
})(PackageType || (exports.PackageType = PackageType = {}));
exports.PACKAGE_SESSIONS = {
    [PackageType.ONE_MONTH]: 5,
    [PackageType.TWO_MONTHS]: 10,
    [PackageType.FOUR_MONTHS]: 20,
};
let Member = class Member extends base_entity_1.BaseEntity {
    get remainingSessions() {
        return this.totalSessions - this.usedSessions;
    }
};
exports.Member = Member;
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (u) => u.member),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Member.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Member.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Member.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Member.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], Member.prototype, "height", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: Gender }),
    __metadata("design:type", String)
], Member.prototype, "gender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'joined_at', type: 'date' }),
    __metadata("design:type", Date)
], Member.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expires_at', type: 'date' }),
    __metadata("design:type", Date)
], Member.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: PackageType, name: 'package_type' }),
    __metadata("design:type", String)
], Member.prototype, "packageType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_sessions' }),
    __metadata("design:type", Number)
], Member.prototype, "totalSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'used_sessions', default: 0 }),
    __metadata("design:type", Number)
], Member.prototype, "usedSessions", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "goal", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'avatar_url', nullable: true }),
    __metadata("design:type", String)
], Member.prototype, "avatarUrl", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => session_entity_1.Session, (s) => s.member),
    __metadata("design:type", Array)
], Member.prototype, "sessions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => program_entity_1.Program, (p) => p.member),
    __metadata("design:type", Array)
], Member.prototype, "programs", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => nutrition_plan_entity_1.NutritionPlan, (n) => n.member),
    __metadata("design:type", Array)
], Member.prototype, "nutritionPlans", void 0);
exports.Member = Member = __decorate([
    (0, typeorm_1.Entity)('members')
], Member);
//# sourceMappingURL=member.entity.js.map