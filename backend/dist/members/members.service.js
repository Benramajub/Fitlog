"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MembersService = exports.UpdateMemberDto = exports.CreateMemberDto = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const dayjs_1 = __importDefault(require("dayjs"));
const member_entity_1 = require("../database/entities/member.entity");
const user_entity_1 = require("../database/entities/user.entity");
class CreateMemberDto {
}
exports.CreateMemberDto = CreateMemberDto;
class UpdateMemberDto {
}
exports.UpdateMemberDto = UpdateMemberDto;
let MembersService = class MembersService {
    constructor(memberRepo, userRepo) {
        this.memberRepo = memberRepo;
        this.userRepo = userRepo;
    }
    async findAll() {
        return this.memberRepo.find({
            order: { createdAt: 'DESC' },
            relations: ['user'],
        });
    }
    async findOne(id) {
        const member = await this.memberRepo.findOne({
            where: { id },
            relations: ['user', 'sessions', 'nutritionPlans'],
        });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        return member;
    }
    async create(dto) {
        if (!dto.email)
            throw new common_1.BadRequestException('Email is required');
        if (!dto.name)
            throw new common_1.BadRequestException('Name is required');
        if (!dto.packageType)
            throw new common_1.BadRequestException('Package type is required');
        if (!dto.joinedAt)
            throw new common_1.BadRequestException('Join date is required');
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException(`Email "${dto.email}" is already in use`);
        const joinedAt = (0, dayjs_1.default)(dto.joinedAt);
        const monthsMap = {
            [member_entity_1.PackageType.ONE_MONTH]: 1,
            [member_entity_1.PackageType.TWO_MONTHS]: 2,
            [member_entity_1.PackageType.FOUR_MONTHS]: 4,
        };
        const expiresAt = joinedAt.add(monthsMap[dto.packageType], 'month').toDate();
        const totalSessions = member_entity_1.PACKAGE_SESSIONS[dto.packageType];
        const user = this.userRepo.create({
            email: dto.email.trim().toLowerCase(),
            passwordHash: await bcrypt.hash(dto.password || 'member1234', 10),
            role: user_entity_1.UserRole.MEMBER,
        });
        await this.userRepo.save(user);
        const member = this.memberRepo.create({
            user,
            name: dto.name,
            age: dto.age,
            weight: dto.weight,
            height: dto.height,
            gender: dto.gender,
            joinedAt: joinedAt.toDate(),
            expiresAt,
            packageType: dto.packageType,
            totalSessions,
            usedSessions: 0,
            goal: dto.goal,
            notes: dto.notes,
        });
        return this.memberRepo.save(member);
    }
    async update(id, dto) {
        const member = await this.findOne(id);
        Object.assign(member, dto);
        if (dto.packageType) {
            member.totalSessions = member_entity_1.PACKAGE_SESSIONS[dto.packageType];
        }
        return this.memberRepo.save(member);
    }
    async remove(id) {
        const member = await this.findOne(id);
        await this.memberRepo.softRemove(member);
        return { success: true };
    }
    async getStats(id) {
        const member = await this.findOne(id);
        return {
            remainingSessions: member.totalSessions - member.usedSessions,
            usedSessions: member.usedSessions,
            totalSessions: member.totalSessions,
            expiresAt: member.expiresAt,
            isExpired: (0, dayjs_1.default)().isAfter((0, dayjs_1.default)(member.expiresAt)),
            daysLeft: (0, dayjs_1.default)(member.expiresAt).diff((0, dayjs_1.default)(), 'day'),
        };
    }
};
exports.MembersService = MembersService;
exports.MembersService = MembersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], MembersService);
//# sourceMappingURL=members.service.js.map