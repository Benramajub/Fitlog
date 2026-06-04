import {
  Entity, Column, OneToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Session } from './session.entity';
import { Program } from './program.entity';
import { NutritionPlan } from './nutrition-plan.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum PackageType {
  ONE_MONTH = '1_month',
  TWO_MONTHS = '2_months',
  FOUR_MONTHS = '4_months',
}

export const PACKAGE_SESSIONS: Record<PackageType, number> = {
  [PackageType.ONE_MONTH]: 5,
  [PackageType.TWO_MONTHS]: 10,
  [PackageType.FOUR_MONTHS]: 20,
};

@Entity('members')
export class Member extends BaseEntity {
  @OneToOne(() => User, (u) => u.member)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id', nullable: true })
  userId: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  weight: number; // kg

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  height: number; // cm

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column({ name: 'joined_at', type: 'date' })
  joinedAt: Date;

  @Column({ name: 'expires_at', type: 'date' })
  expiresAt: Date;

  @Column({ type: 'enum', enum: PackageType, name: 'package_type' })
  packageType: PackageType;

  @Column({ name: 'total_sessions' })
  totalSessions: number;

  @Column({ name: 'used_sessions', default: 0 })
  usedSessions: number;

  @Column({ nullable: true })
  goal?: string;

  @Column({ nullable: true })
  notes?: string; // health notes / precautions

  @Column({ name: 'avatar_url', nullable: true })
  avatarUrl?: string;

  @OneToMany(() => Session, (s) => s.member)
  sessions: Session[];

  @OneToMany(() => Program, (p) => p.member)
  programs: Program[];

  @OneToMany(() => NutritionPlan, (n) => n.member)
  nutritionPlans: NutritionPlan[];

  get remainingSessions(): number {
    return this.totalSessions - this.usedSessions;
  }
}
