import {
  Entity, Column, ManyToOne, JoinColumn, OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Member } from './member.entity';
import { ProgramExercise } from './program-exercise.entity';

@Entity('programs')
export class Program extends BaseEntity {
  @ManyToOne(() => Member, (m) => m.programs)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @Column({ name: 'member_id' })
  memberId: string;

  @Column()
  name: string; // e.g. "Week 1 Program"

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => ProgramDay, (d) => d.program, { cascade: true, eager: true })
  days: ProgramDay[];
}

@Entity('program_days')
export class ProgramDay extends BaseEntity {
  @ManyToOne(() => Program, (p) => p.days)
  @JoinColumn({ name: 'program_id' })
  program: Program;

  @Column({ name: 'program_id' })
  programId: string;

  @Column()
  title: string; // e.g. "Upper Body", "Lower Body"

  @Column({ name: 'day_order', default: 1 })
  dayOrder: number;

  @OneToMany(() => ProgramExercise, (e) => e.programDay, { cascade: true, eager: true })
  exercises: ProgramExercise[];
}
