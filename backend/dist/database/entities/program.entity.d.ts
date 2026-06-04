import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { ProgramExercise } from './program-exercise.entity';
export declare class Program extends BaseEntity {
    member: Member;
    memberId: string;
    name: string;
    description?: string;
    isActive: boolean;
    days: ProgramDay[];
}
export declare class ProgramDay extends BaseEntity {
    program: Program;
    programId: string;
    title: string;
    dayOrder: number;
    exercises: ProgramExercise[];
}
