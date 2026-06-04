import { SessionsService } from './sessions.service';
export declare class SessionsController {
    private readonly sessionsService;
    constructor(sessionsService: SessionsService);
    findAll(memberId?: string, date?: string): Promise<import("../database/entities/session.entity").Session[]>;
    getCalendar(year: string, month: string): Promise<Record<string, import("../database/entities/session.entity").Session[]>>;
    findOne(id: string): Promise<import("../database/entities/session.entity").Session>;
    schedule(body: {
        memberId: string;
        scheduledAt: string;
        programId?: string;
        notes?: string;
    }): Promise<import("../database/entities/session.entity").Session>;
    start(id: string): Promise<import("../database/entities/session.entity").Session>;
    end(id: string, body: {
        notes?: string;
    }): Promise<import("../database/entities/session.entity").Session>;
    cancel(id: string): Promise<import("../database/entities/session.entity").Session>;
}
