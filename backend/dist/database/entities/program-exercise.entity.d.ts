import { BaseEntity } from './base.entity';
import { ProgramDay } from './program.entity';
export declare class ProgramExercise extends BaseEntity {
    programDay: ProgramDay;
    programDayId: string;
    exerciseName: string;
    defaultWeight?: number;
    defaultSets?: number;
    defaultReps?: number;
    defaultRir?: number;
    defaultRpe?: number;
    notes?: string;
    sortOrder: number;
}
