import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import dayjs from 'dayjs'
import { Session, SessionStatus } from '../database/entities/session.entity';
import { Member } from '../database/entities/member.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private readonly sessionRepo: Repository<Session>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
  ) {}

  async findAll(filters?: { memberId?: string; date?: string }) {
    const qb = this.sessionRepo.createQueryBuilder('s')
      .leftJoinAndSelect('s.member', 'm')
      .leftJoinAndSelect('s.workoutLogs', 'w')
      .orderBy('s.scheduledAt', 'ASC');

    if (filters?.memberId) qb.andWhere('s.memberId = :mid', { mid: filters.memberId });
    if (filters?.date) {
      const d = dayjs(filters.date);
      qb.andWhere('s.scheduledAt BETWEEN :start AND :end', {
        start: d.startOf('day').toISOString(),
        end: d.endOf('day').toISOString(),
      });
    }
    return qb.getMany();
  }

  async findOne(id: string) {
    const s = await this.sessionRepo.findOne({
      where: { id },
      relations: ['member', 'workoutLogs', 'program'],
    });
    if (!s) throw new NotFoundException('Session not found');
    return s;
  }

  async schedule(memberId: string, scheduledAt: string, programId?: string, notes?: string) {
    const member = await this.memberRepo.findOne({ where: { id: memberId } });
    if (!member) throw new NotFoundException('Member not found');
    if (member.remainingSessions <= 0)
      throw new BadRequestException('No remaining sessions');

    const session = this.sessionRepo.create({
      memberId,
      programId,
      scheduledAt: new Date(scheduledAt),
      status: SessionStatus.SCHEDULED,
      notes,
    });
    return this.sessionRepo.save(session);
  }

  async startSession(id: string) {
    const session = await this.findOne(id);
    if (session.status !== SessionStatus.SCHEDULED)
      throw new BadRequestException('Session is not in scheduled state');

    session.status = SessionStatus.IN_PROGRESS;
    session.startedAt = new Date();

    // Deduct from member
    const member = await this.memberRepo.findOne({ where: { id: session.memberId } });
    member.usedSessions += 1;
    await this.memberRepo.save(member);

    return this.sessionRepo.save(session);
  }

  async endSession(id: string, notes?: string) {
    const session = await this.findOne(id);
    session.status = SessionStatus.COMPLETED;
    session.endedAt = new Date();
    if (notes) session.notes = notes;
    return this.sessionRepo.save(session);
  }

  async cancel(id: string) {
    const session = await this.findOne(id);
    if (session.status === SessionStatus.COMPLETED)
      throw new BadRequestException('Cannot cancel a completed session');

    // Refund if was in progress
    if (session.status === SessionStatus.IN_PROGRESS) {
      const member = await this.memberRepo.findOne({ where: { id: session.memberId } });
      member.usedSessions = Math.max(0, member.usedSessions - 1);
      await this.memberRepo.save(member);
    }

    session.status = SessionStatus.CANCELLED;
    return this.sessionRepo.save(session);
  }

  // Calendar: get sessions for a month
  async getCalendar(year: number, month: number) {
    const start = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    const end = dayjs(`${year}-${month}-01`).endOf('month').toDate();

    const sessions = await this.sessionRepo.find({
      where: { scheduledAt: Between(start, end) },
      relations: ['member'],
      order: { scheduledAt: 'ASC' },
    });

    // Group by date
    const grouped: Record<string, typeof sessions> = {};
    for (const s of sessions) {
      const key = dayjs(s.scheduledAt).format('YYYY-MM-DD');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    }
    return grouped;
  }
}
