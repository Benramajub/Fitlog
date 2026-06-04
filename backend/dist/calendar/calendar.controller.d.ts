import { SessionsService } from '../sessions/sessions.service';
export declare class CalendarController {
    private readonly sessions;
    constructor(sessions: SessionsService);
    getCalendar(year: string, month: string): Promise<Record<string, import("../database/entities/session.entity").Session[]>>;
}
