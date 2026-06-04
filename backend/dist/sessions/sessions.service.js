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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const dayjs_1 = __importDefault(require("dayjs"));
const session_entity_1 = require("../database/entities/session.entity");
const member_entity_1 = require("../database/entities/member.entity");
let SessionsService = class SessionsService {
    constructor(sessionRepo, memberRepo) {
        this.sessionRepo = sessionRepo;
        this.memberRepo = memberRepo;
    }
    async findAll(filters) {
        const qb = this.sessionRepo.createQueryBuilder('s')
            .leftJoinAndSelect('s.member', 'm')
            .leftJoinAndSelect('s.workoutLogs', 'w')
            .orderBy('s.scheduledAt', 'ASC');
        if (filters?.memberId)
            qb.andWhere('s.memberId = :mid', { mid: filters.memberId });
        if (filters?.date) {
            const d = (0, dayjs_1.default)(filters.date);
            qb.andWhere('s.scheduledAt BETWEEN :start AND :end', {
                start: d.startOf('day').toISOString(),
                end: d.endOf('day').toISOString(),
            });
        }
        return qb.getMany();
    }
    async findOne(id) {
        const s = await this.sessionRepo.findOne({
            where: { id },
            relations: ['member', 'workoutLogs', 'program'],
        });
        if (!s)
            throw new common_1.NotFoundException('Session not found');
        return s;
    }
    async schedule(memberId, scheduledAt, programId, notes) {
        const member = await this.memberRepo.findOne({ where: { id: memberId } });
        if (!member)
            throw new common_1.NotFoundException('Member not found');
        if (member.remainingSessions <= 0)
            throw new common_1.BadRequestException('No remaining sessions');
        const session = this.sessionRepo.create({
            memberId,
            programId,
            scheduledAt: new Date(scheduledAt),
            status: session_entity_1.SessionStatus.SCHEDULED,
            notes,
        });
        return this.sessionRepo.save(session);
    }
    async startSession(id) {
        const session = await this.findOne(id);
        if (session.status !== session_entity_1.SessionStatus.SCHEDULED)
            throw new common_1.BadRequestException('Session is not in scheduled state');
        session.status = session_entity_1.SessionStatus.IN_PROGRESS;
        session.startedAt = new Date();
        const member = await this.memberRepo.findOne({ where: { id: session.memberId } });
        member.usedSessions += 1;
        await this.memberRepo.save(member);
        return this.sessionRepo.save(session);
    }
    async endSession(id, notes) {
        const session = await this.findOne(id);
        session.status = session_entity_1.SessionStatus.COMPLETED;
        session.endedAt = new Date();
        if (notes)
            session.notes = notes;
        return this.sessionRepo.save(session);
    }
    async cancel(id) {
        const session = await this.findOne(id);
        if (session.status === session_entity_1.SessionStatus.COMPLETED)
            throw new common_1.BadRequestException('Cannot cancel a completed session');
        if (session.status === session_entity_1.SessionStatus.IN_PROGRESS) {
            const member = await this.memberRepo.findOne({ where: { id: session.memberId } });
            member.usedSessions = Math.max(0, member.usedSessions - 1);
            await this.memberRepo.save(member);
        }
        session.status = session_entity_1.SessionStatus.CANCELLED;
        return this.sessionRepo.save(session);
    }
    async getCalendar(year, month) {
        const start = (0, dayjs_1.default)(`${year}-${month}-01`).startOf('month').toDate();
        const end = (0, dayjs_1.default)(`${year}-${month}-01`).endOf('month').toDate();
        const sessions = await this.sessionRepo.find({
            where: { scheduledAt: (0, typeorm_2.Between)(start, end) },
            relations: ['member'],
            order: { scheduledAt: 'ASC' },
        });
        const grouped = {};
        for (const s of sessions) {
            const key = (0, dayjs_1.default)(s.scheduledAt).format('YYYY-MM-DD');
            if (!grouped[key])
                grouped[key] = [];
            grouped[key].push(s);
        }
        return grouped;
    }
};
exports.SessionsService = SessionsService;
exports.SessionsService = SessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(session_entity_1.Session)),
    __param(1, (0, typeorm_1.InjectRepository)(member_entity_1.Member)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SessionsService);
//# sourceMappingURL=sessions.service.js.map