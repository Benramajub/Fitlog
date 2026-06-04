import { ProgramsService } from './programs.service';
export declare class ProgramsController {
    private readonly s;
    constructor(s: ProgramsService);
    findByMember(memberId: string): Promise<import("../database/entities/program.entity").Program[]>;
    findOne(id: string): Promise<import("../database/entities/program.entity").Program>;
    create(body: any): Promise<import("../database/entities/program.entity").Program>;
    addDay(id: string, body: {
        title: string;
        dayOrder?: number;
    }): Promise<import("../database/entities/program.entity").ProgramDay>;
    updateDay(dayId: string, body: {
        title: string;
    }): Promise<import("../database/entities/program.entity").ProgramDay>;
    addExercise(dayId: string, body: any): Promise<import("../database/entities/program-exercise.entity").ProgramExercise>;
    updateExercise(exId: string, body: any): Promise<import("../database/entities/program-exercise.entity").ProgramExercise>;
    removeExercise(exId: string): Promise<{
        success: boolean;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
