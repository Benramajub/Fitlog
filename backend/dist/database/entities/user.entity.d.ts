import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
export declare enum UserRole {
    ADMIN = "admin",
    MEMBER = "member"
}
export declare class User extends BaseEntity {
    email: string;
    passwordHash: string;
    role: UserRole;
    isActive: boolean;
    refreshToken?: string;
    member?: Member;
}
