import { Repository } from "typeorm";
import { WorkoutLog } from "../database/entities/workout-log.entity";
import { Session } from "../database/entities/session.entity";
import { ProgramDay, Program } from "../database/entities/program.entity";
export interface WorkoutLogDto {
    dayTitle?: string;
    exerciseName: string;
    weight: number;
    sets: number;
    reps: number;
    rir?: number;
    rpe?: number;
    notes?: string;
    sortOrder?: number;
}
export declare class WorkoutLogsService {
    private logRepo;
    private sessionRepo;
    private dayRepo;
    private programRepo;
    constructor(logRepo: Repository<WorkoutLog>, sessionRepo: Repository<Session>, dayRepo: Repository<ProgramDay>, programRepo: Repository<Program>);
    getLogsForSession(sessionId: string): Promise<WorkoutLog[]>;
    getPrefilled(sessionId: string): Promise<Partial<WorkoutLog>[]>;
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
    saveLog(sessionId: string, dto: WorkoutLogDto): Promise<WorkoutLog>;
    saveBulk(sessionId: string, dtos: WorkoutLogDto[]): Promise<WorkoutLog[]>;
    updateLog(id: string, dto: Partial<WorkoutLogDto>): Promise<WorkoutLog>;
    deleteLog(id: string): Promise<{
        success: boolean;
    }>;
    getMemberHistory(memberId: string, exerciseName?: string): Promise<WorkoutLog[]>;
}
