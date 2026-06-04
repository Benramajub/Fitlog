'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { sessionsApi, workoutLogsApi } from '@/lib/api';
import { Session, WorkoutLog } from '@/types';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface LogRow {
  id?: string;
  dayTitle: string;
  exerciseName: string;
  weight: string;
  sets: string;
  reps: string;
  rir: string;
  rpe: string;
  notes: string;
  saved: boolean;
}

export default function SessionLogPage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const loadSession = async () => {
      const s = await sessionsApi.get(id);
      setSession(s);
      // Try to get prefilled from program
      const prefilled = await workoutLogsApi.getPrefilled(id).catch(() => []);
      const savedLogs: WorkoutLog[] = await workoutLogsApi.getForSession(id).catch(() => []);

      if (savedLogs.length > 0) {
        setRows(savedLogs.map(l => ({
          id: l.id, dayTitle: l.dayTitle || '', exerciseName: l.exerciseName,
          weight: String(l.weight), sets: String(l.sets), reps: String(l.reps),
          rir: String(l.rir ?? ''), rpe: String(l.rpe ?? ''), notes: l.notes || '', saved: true,
        })));
      } else if (prefilled.length > 0) {
        setRows(prefilled.map((p: any) => ({
          dayTitle: p.dayTitle || '', exerciseName: p.exerciseName,
          weight: String(p.weight || ''), sets: String(p.sets || 3), reps: String(p.reps || 10),
          rir: String(p.rir ?? 2), rpe: String(p.rpe ?? 8), notes: p.notes || '', saved: false,
        })));
      }
    };
    loadSession();
  }, [id]);

  // Elapsed timer
  useEffect(() => {
    if (!session?.startedAt) return;
    const timer = setInterval(() => {
      setElapsed(dayjs().diff(dayjs(session.startedAt), 'second'));
    }, 1000);
    return () => clearInterval(timer);
  }, [session?.startedAt]);

  const addRow = (dayTitle?: string) => {
    setRows(prev => [...prev, {
      dayTitle: dayTitle || '', exerciseName: '', weight: '', sets: '3', reps: '10', rir: '2', rpe: '8', notes: '', saved: false,
    }]);
  };

  const updateRow = (i: number, k: keyof LogRow, v: string) => {
    setRows(prev => prev.map((r, ri) => ri === i ? { ...r, [k]: v, saved: false } : r));
  };

  const removeRow = (i: number) => {
    setRows(prev => prev.filter((_, ri) => ri !== i));
  };

  const saveAll = async () => {
    const invalid = rows.find(r => !r.exerciseName || !r.weight || !r.sets || !r.reps);
    if (invalid) return toast.error('กรอกข้อมูลท่าให้ครบ (ชื่อท่า, น้ำหนัก, เซ็ต, ครั้ง)');
    setSaving(true);
    try {
      await workoutLogsApi.saveBulk(id, rows.map((r, i) => ({
        dayTitle: r.dayTitle, exerciseName: r.exerciseName,
        weight: +r.weight, sets: +r.sets, reps: +r.reps,
        rir: r.rir ? +r.rir : undefined, rpe: r.rpe ? +r.rpe : undefined,
        notes: r.notes, sortOrder: i,
      })));
      setRows(prev => prev.map(r => ({ ...r, saved: true })));
      toast.success('บันทึก Workout Log แล้ว!');
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const endSession = async () => {
    if (!confirm('จบ Session นี้?')) return;
    await sessionsApi.end(id);
    toast.success('จบ Session แล้ว');
  };

  const fmt = (s: number) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const totalVolume = rows.reduce((sum, r) => sum + (+r.weight || 0) * (+r.sets || 0) * (+r.reps || 0), 0);

  if (!session) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="btn-ghost btn-sm">← กลับ</Link>
          <div>
            <h1 className="page-title">Workout Log</h1>
            <p className="text-sm text-gray-500">{session.member?.name} • {dayjs(session.scheduledAt).format('DD/MM/YYYY')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {session.startedAt && (
            <div className="text-center">
              <div className="font-mono text-2xl font-bold text-blue-600">{fmt(elapsed)}</div>
              <div className="text-xs text-gray-400">เวลาที่ใช้</div>
            </div>
          )}
          <div className="text-center">
            <div className="font-bold text-gray-900">{totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Volume (kg)</div>
          </div>
          <button onClick={saveAll} disabled={saving} className="btn-primary">
            {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
          </button>
          {session.status === 'in_progress' && (
            <button onClick={endSession} className="btn-success">✅ จบ Session</button>
          )}
        </div>
      </div>

      {/* Status banner */}
      {session.status === 'scheduled' && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm flex items-center gap-2">
          ⚠️ Session ยังไม่เริ่ม — ไปที่หน้าสมาชิกหรือ Dashboard เพื่อกด "เริ่มเทรน"
        </div>
      )}

      {/* Workout table */}
      <div className="card overflow-x-auto">
        <div className="card-header">
          <h3 className="font-semibold">รายการท่าออกกำลังกาย</h3>
          <div className="flex gap-2">
            <button onClick={() => addRow()} className="btn-secondary btn-sm">+ เพิ่มท่า</button>
          </div>
        </div>
        <table className="table-base min-w-[900px]">
          <thead>
            <tr>
              <th className="w-28">วัน/กลุ่ม</th>
              <th className="w-40">ชื่อท่า *</th>
              <th className="w-24">น้ำหนัก (kg) *</th>
              <th className="w-16">Set *</th>
              <th className="w-16">Reps *</th>
              <th className="w-16">Volume</th>
              <th className="w-16">RIR</th>
              <th className="w-16">RPE</th>
              <th>หมายเหตุ</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={row.saved ? 'bg-emerald-50/40' : ''}>
                <td>
                  <input className="input text-xs" placeholder="Upper Body" value={row.dayTitle} onChange={e => updateRow(i, 'dayTitle', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs font-medium" placeholder="Barbell Squat" value={row.exerciseName} onChange={e => updateRow(i, 'exerciseName', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs text-center" type="number" step="2.5" value={row.weight} onChange={e => updateRow(i, 'weight', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs text-center" type="number" min="1" value={row.sets} onChange={e => updateRow(i, 'sets', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs text-center" type="number" min="1" value={row.reps} onChange={e => updateRow(i, 'reps', e.target.value)} />
                </td>
                <td>
                  <span className="text-xs font-semibold text-blue-600">
                    {((+row.weight || 0) * (+row.sets || 0) * (+row.reps || 0)).toLocaleString()}
                  </span>
                </td>
                <td>
                  <input className="input text-xs text-center" type="number" min="0" max="5" value={row.rir} onChange={e => updateRow(i, 'rir', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs text-center" type="number" min="1" max="10" step="0.5" value={row.rpe} onChange={e => updateRow(i, 'rpe', e.target.value)} />
                </td>
                <td>
                  <input className="input text-xs" placeholder="หมายเหตุ" value={row.notes} onChange={e => updateRow(i, 'notes', e.target.value)} />
                </td>
                <td>
                  <button onClick={() => removeRow(i)} className="text-red-400 hover:text-red-600 text-sm px-1">×</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="text-center py-12 text-gray-400">
                ยังไม่มีท่า — กด "+ เพิ่มท่า" หรือโปรแกรมจะถูกโหลดอัตโนมัติถ้ามีการ assign
              </td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan={5} className="px-4 py-2 text-xs font-semibold text-gray-500">รวม</td>
                <td className="px-4 py-2 text-sm font-bold text-blue-600">{totalVolume.toLocaleString()} kg</td>
                <td colSpan={4} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
