import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Session } from './session.entity';

@Entity('workout_logs')
export class WorkoutLog extends BaseEntity {
  @ManyToOne(() => Session, (s) => s.workoutLogs)
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ name: 'session_id' })
  sessionId: string;

  @Column({ name: 'day_title', nullable: true })
  dayTitle?: string; // "Upper Body" etc.

  @Column({ name: 'exercise_name' })
  exerciseName: string;

  @Column({ type: 'decimal', precision: 6, scale: 2 })
  weight: number; // kg

  @Column()
  sets: number;

  @Column()
  reps: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'volume_kg' })
  volumeKg: number; // weight * sets * reps

  @Column({ nullable: true })
  rir?: number;

  @Column({ type: 'decimal', precision: 3, scale: 1, nullable: true })
  rpe?: number;

  @Column({ nullable: true })
  notes?: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;
}
