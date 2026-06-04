import { Repository } from 'typeorm';
import { Program, ProgramDay } from '../database/entities/program.entity';
import { ProgramExercise } from '../database/entities/program-exercise.entity';
export declare class ProgramsService {
    private programRepo;
    private dayRepo;
    private exRepo;
    constructor(programRepo: Repository<Program>, dayRepo: Repository<ProgramDay>, exRepo: Repository<ProgramExercise>);
    findByMember(memberId: string): Promise<Program[]>;
    findOne(id: string): Promise<Program>;
    create(memberId: string, data: {
        name: string;
        description?: string;
        days: Array<{
            title: string;
            dayOrder?: number;
            exercises: Partial<ProgramExercise>[];
        }>;
    }): Promise<Program>;
    addDay(programId: string, title: string, dayOrder: number): Promise<ProgramDay>;
    updateDay(dayId: string, title: string): Promise<ProgramDay>;
    addExercise(programDayId: string, data: Partial<ProgramExercise>): Promise<ProgramExercise>;
    updateExercise(id: string, data: Partial<ProgramExercise>): Promise<ProgramExercise>;
    removeExercise(id: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
