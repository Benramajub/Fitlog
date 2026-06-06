import { WorkoutLogsService, WorkoutLogDto } from "./workout-logs.service";
export declare class WorkoutLogsController {
    private readonly s;
    constructor(s: WorkoutLogsService);
    getForSession(id: string): Promise<import("../database/entities/workout-log.entity").WorkoutLog[]>;
    getPrefilled(id: string): Promise<Partial<import("../database/entities/workout-log.entity").WorkoutLog>[]>;
    getPrefilledFromDay(dayId: string): Promise<{
        dayTitle: string;
        exerciseName: string;
        weight: number;
        sets: number;
        reps: number;
        volumeKg: number;
        rir: number;
        rpe: number;
        notes: string;
        sortOrder: number;
    }[]>;
    getHistory(memberId: string, exercise?: string): Promise<import("../database/entities/workout-log.entity").WorkoutLog[]>;
    saveLog(sessionId: string, dto: WorkoutLogDto): Promise<import("../database/entities/workout-log.entity").WorkoutLog>;
    saveBulk(sessionId: string, body: {
        logs: WorkoutLogDto[];
    }): Promise<import("../database/entities/workout-log.entity").WorkoutLog[]>;
    update(id: string, dto: Partial<WorkoutLogDto>): Promise<import("../database/entities/workout-log.entity").WorkoutLog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
