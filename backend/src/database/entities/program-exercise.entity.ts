import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProgramDay } from './program.entity';

@Entity('program_exercises')
export class ProgramExercise extends BaseEntity {
  @ManyToOne(() => ProgramDay, (d) => d.exercises)
  @JoinColumn({ name: 'program_day_id' })
  programDay: ProgramDay;

  @Column({ name: 'program_day_id' })
  programDayId: string;

  @Column({ name: 'exercise_name' })
  exerciseName: string;

  @Column({ name: 'default_weight', type: 'decimal', precision: 6, scale: 2, nullable: true })
  defaultWeight?: number;

  @Column({ name: 'default_sets', nullable: true })
  defaultSets?: number;

  @Column({ name: 'default_reps', nullable: true })
  defaultReps?: number;

  @Column({ name: 'default_rir', nullable: true })
  defaultRir?: number;

  @Column({ name: 'default_rpe', type: 'decimal', precision: 3, scale: 1, nullable: true })
  defaultRpe?: number;

  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
