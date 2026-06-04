import { BaseEntity } from './base.entity';
import { Session } from './session.entity';
export declare class WorkoutLog extends BaseEntity {
    session: Session;
    sessionId: string;
    dayTitle?: string;
    exerciseName: string;
    weight: number;
    sets: number;
    reps: number;
    volumeKg: number;
    rir?: number;
    rpe?: number;
    notes?: string;
    sortOrder: number;
}
