import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { WorkoutLog } from './workout-log.entity';
import { Program } from './program.entity';
export declare enum SessionStatus {
    SCHEDULED = "scheduled",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Session extends BaseEntity {
    member: Member;
    memberId: string;
    program?: Program;
    programId?: string;
    scheduledAt: Date;
    startedAt?: Date;
    endedAt?: Date;
    status: SessionStatus;
    notes?: string;
    workoutLogs: WorkoutLog[];
}
