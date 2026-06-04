import { Repository } from 'typeorm';
import { Member, PackageType, Gender } from '../database/entities/member.entity';
import { User } from '../database/entities/user.entity';
export declare class CreateMemberDto {
    name: string;
    email: string;
    password?: string;
    age: number;
    weight: number;
    height: number;
    gender: Gender;
    joinedAt: string;
    packageType: PackageType;
    goal?: string;
    notes?: string;
}
export declare class UpdateMemberDto {
    name?: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
    notes?: string;
    packageType?: PackageType;
}
export declare class MembersService {
    private readonly memberRepo;
    private readonly userRepo;
    constructor(memberRepo: Repository<Member>, userRepo: Repository<User>);
    findAll(): Promise<Member[]>;
    findOne(id: string): Promise<Member>;
    create(dto: CreateMemberDto): Promise<Member>;
    update(id: string, dto: UpdateMemberDto): Promise<Member>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    getStats(id: string): Promise<{
        remainingSessions: number;
        usedSessions: number;
        totalSessions: number;
        expiresAt: Date;
        isExpired: boolean;
        daysLeft: number;
    }>;
}
