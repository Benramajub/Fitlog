import {
  Entity, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { WorkoutLog } from './workout-log.entity';
import { Program } from './program.entity';

export enum SessionStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('sessions')
export class Session extends BaseEntity {
  @ManyToOne(() => Member, (m) => m.sessions)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: string;

  @ManyToOne(() => Program, { nullable: true })
  @JoinColumn({ name: 'program_id' })
  program?: Program;

  @Column({ name: 'program_id', nullable: true })
  programId?: string;

  @Column({ name: 'scheduled_at', type: 'timestamptz' })
  scheduledAt: Date;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date;

  @Column({ type: 'enum', enum: SessionStatus, default: SessionStatus.SCHEDULED })
  status: SessionStatus;

  @Column({ nullable: true })
  notes?: string;

  @OneToMany(() => WorkoutLog, (w) => w.session, { cascade: true })
  workoutLogs: WorkoutLog[];
}
