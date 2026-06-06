export interface AuthUser { id: string; email: string; role: 'admin' | 'member'; memberId?: string | null; }
export type Gender = 'male' | 'female';
export type PackageType = '1_month' | '2_months' | '4_months';
export interface Member { id: string; userId?: string; name: string; age: number; weight: number; height: number; gender: Gender; joinedAt: string; expiresAt: string; packageType: PackageType; totalSessions: number; usedSessions: number; goal?: string; notes?: string; createdAt: string; user?: { email: string }; }
export interface MemberStats { remainingSessions: number; usedSessions: number; totalSessions: number; expiresAt: string; isExpired: boolean; daysLeft: number; }
export type SessionStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export interface Session { id: string; memberId: string; member?: Member; programId?: string; scheduledAt: string; startedAt?: string; endedAt?: string; status: SessionStatus; notes?: string; workoutLogs?: WorkoutLog[]; }
export interface ProgramExercise { id: string; programDayId: string; exerciseName: string; defaultWeight?: number; defaultSets?: number; defaultReps?: number; defaultRir?: number; defaultRpe?: number; notes?: string; sortOrder: number; }
export interface ProgramDay { id: string; programId: string; title: string; dayOrder: number; exercises: ProgramExercise[]; }
export interface Program { id: string; memberId: string; name: string; description?: string; isActive: boolean; days: ProgramDay[]; createdAt: string; }
export interface WorkoutLog { id: string; sessionId: string; dayTitle?: string; exerciseName: string; weight: number; sets: number; reps: number; volumeKg: number; rir?: number; rpe?: number; notes?: string; sortOrder: number; }
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'heavy' | 'very_heavy';
export interface NutritionPlan { id: string; memberId: string; activityLevel: ActivityLevel; lbm?: number; bmr: number; tdee: number; targetCalories: number; proteinG: number; fatG: number; carbG: number; calorieGoal?: number; isActive: boolean; notes?: string; dailyLogs?: DailyCalorieLog[]; }
export interface DailyCalorieLog { id: string; nutritionPlanId: string; logDate: string; caloriesConsumed: number; proteinG: number; fatG: number; carbG: number; notes?: string; }
export interface CalcResult { bmr: number; tdee: number; targetCalories: number; proteinG: number; fatG: number; carbG: number; }
export type CalendarData = Record<string, Session[]>;
export const PACKAGE_LABELS: Record<PackageType, string> = { '1_month': '1 เดือน (5 ครั้ง)', '2_months': '2 เดือน (10 ครั้ง)', '4_months': '4 เดือน (20 ครั้ง)' };
export const ACTIVITY_LABELS: Record<ActivityLevel, string> = { sedentary: 'ไม่ออกกำลังกาย / นั่งโต๊ะ', light: 'เบาๆ (1-3 วัน/สัปดาห์)', moderate: 'ปานกลาง (3-5 วัน/สัปดาห์)', heavy: 'หนัก (6-7 วัน/สัปดาห์)', very_heavy: 'หนักมาก (เช้า-เย็นทุกวัน)' };
export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = { scheduled: 'นัดไว้', in_progress: 'กำลังเทรน', completed: 'เสร็จแล้ว', cancelled: 'ยกเลิก' };
export const SESSION_STATUS_COLORS: Record<SessionStatus, string> = { scheduled: 'badge-amber', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };