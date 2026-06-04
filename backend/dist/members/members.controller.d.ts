import { MembersService, CreateMemberDto, UpdateMemberDto } from './members.service';
export declare class MembersController {
    private readonly membersService;
    constructor(membersService: MembersService);
    findAll(): Promise<import("../database/entities/member.entity").Member[]>;
    getStats(id: string): Promise<{
        remainingSessions: number;
        usedSessions: number;
        totalSessions: number;
        expiresAt: Date;
        isExpired: boolean;
        daysLeft: number;
    }>;
    findOne(id: string): Promise<import("../database/entities/member.entity").Member>;
    create(dto: CreateMemberDto): Promise<import("../database/entities/member.entity").Member>;
    update(id: string, dto: UpdateMemberDto): Promise<import("../database/entities/member.entity").Member>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
