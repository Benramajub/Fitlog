import { Repository } from 'typeorm';
import { Session } from '../database/entities/session.entity';
import { Member } from '../database/entities/member.entity';
export declare class SessionsService {
    private readonly sessionRepo;
    private readonly memberRepo;
    constructor(sessionRepo: Repository<Session>, memberRepo: Repository<Member>);
    findAll(filters?: {
        memberId?: string;
        date?: string;
    }): Promise<Session[]>;
    findOne(id: string): Promise<Session>;
    schedule(memberId: string, scheduledAt: string, programId?: string, notes?: string): Promise<Session>;
    startSession(id: string): Promise<Session>;
    endSession(id: string, notes?: string): Promise<Session>;
    cancel(id: string): Promise<Session>;
    getCalendar(year: number, month: number): Promise<Record<string, Session[]>>;
}
