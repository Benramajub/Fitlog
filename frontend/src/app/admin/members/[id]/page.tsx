'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { membersApi, nutritionApi, sessionsApi, programsApi } from '@/lib/api';
import { Member, MemberStats, NutritionPlan, Session, Program, PACKAGE_LABELS, ACTIVITY_LABELS } from '@/types';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { MacroPieChart } from '@/components/charts/MacroPieChart';

type Tab = 'overview' | 'nutrition' | 'programs' | 'sessions';

export default function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('overview');
  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [calorieChart, setCalorieChart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      membersApi.get(id),
      membersApi.stats(id),
      nutritionApi.getActivePlan(id).catch(() => null),
      sessionsApi.list({ memberId: id }),
      programsApi.listByMember(id),
    ]).then(([m, s, p, sess, prog]) => {
      setMember(m); setStats(s); setPlan(p);
      setSessions(sess); setPrograms(prog);
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (tab === 'nutrition' && id) {
      nutritionApi.getChart(id, 30).then(setCalorieChart).catch(() => {});
    }
  }, [tab, id]);

  if (loading || !member) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const isExpired = stats?.isExpired;
  const progressPct = stats ? (stats.usedSessions / stats.totalSessions) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/members" className="btn-ghost btn-sm">← กลับ</Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
              {member.name[0]}
            </div>
            <div>
              <h1 className="font-display text-xl">{member.name}</h1>
              <p className="text-sm text-gray-500">{member.user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/admin/sessions`} className="btn-primary">
            + นัดหมาย
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat label="น้ำหนัก" value={`${member.weight} kg`} />
        <QuickStat label="ส่วนสูง" value={`${member.height} cm`} />
        <QuickStat label="BMI" value={(+member.weight / Math.pow(+member.height / 100, 2)).toFixed(1)} />
        <QuickStat label="เหลือ" value={`${stats?.remainingSessions ?? 0} ครั้ง`}
          sub={isExpired ? '⚠️ หมดอายุแล้ว' : `${stats?.daysLeft ?? 0} วัน`}
          subColor={isExpired ? 'text-red-500' : 'text-emerald-600'} />
      </div>

      {/* Session progress bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="section-title">ความคืบหน้าการเทรน</span>
          <span className="text-sm font-semibold text-gray-700">{stats?.usedSessions}/{stats?.totalSessions} ครั้ง</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${progressPct >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, progressPct)}%` }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">แพ็กเกจ: {PACKAGE_LABELS[member.packageType]}</span>
          <span className="text-xs text-gray-400">หมดอายุ: {dayjs(member.expiresAt).format('DD/MM/YYYY')}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-1">
        {([['overview','📋 ข้อมูลทั่วไป'],['nutrition','🥗 โภชนาการ'],['programs','🏋️ โปรแกรม'],['sessions','📅 Session']] as [Tab,string][]).map(([t, label]) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab member={member} />}
      {tab === 'nutrition' && <NutritionTab member={member} plan={plan} setPlan={setPlan} chart={calorieChart} />}
      {tab === 'programs' && <ProgramsTab memberId={id} programs={programs} setPrograms={setPrograms} />}
      {tab === 'sessions' && <SessionsTab sessions={sessions} setSessions={setSessions} memberId={id} />}
    </div>
  );
}

// ─── Sub-tabs ────────────────────────────────────────────────────

function QuickStat({ label, value, sub, subColor }: any) {
  return (
    <div className="stat-card">
      <div className="section-title mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className={`text-xs mt-0.5 ${subColor || 'text-gray-400'}`}>{sub}</div>}
    </div>
  );
}

function OverviewTab({ member }: { member: Member }) {
  const rows = [
    ['เพศ', member.gender === 'male' ? 'ชาย' : 'หญิง'],
    ['อายุ', `${member.age} ปี`],
    ['น้ำหนัก', `${member.weight} kg`],
    ['ส่วนสูง', `${member.height} cm`],
    ['เป้าหมาย', member.goal || '-'],
    ['ข้อควรระวัง', member.notes || '-'],
    ['วันที่สมัคร', dayjs(member.joinedAt).format('DD/MM/YYYY')],
    ['วันหมดอายุ', dayjs(member.expiresAt).format('DD/MM/YYYY')],
  ];
  return (
    <div className="card">
      <div className="card-header"><h3 className="font-semibold">ข้อมูลสมาชิก</h3></div>
      <table className="table-base">
        <tbody>
          {rows.map(([k, v]) => (
            <tr key={k}><td className="text-gray-500 w-40">{k}</td><td className="font-medium">{v}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NutritionTab({ member, plan, setPlan, chart }: any) {
  const [activityLevel, setActivityLevel] = useState(plan?.activityLevel || 'moderate');
  const [calorieGoal, setCalorieGoal] = useState(plan?.calorieGoal || '');
  const [preview, setPreview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [logDate, setLogDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [logData, setLogData] = useState({ caloriesConsumed: '', proteinG: '', fatG: '', carbG: '', notes: '' });

  const calculate = async () => {
    const r = await nutritionApi.calculate({
      memberId: member.id, activityLevel,
      calorieGoal: calorieGoal ? +calorieGoal : undefined,
    });
    setPreview(r);
  };

  const savePlan = async () => {
    setSaving(true);
    try {
      const p = await nutritionApi.createPlan({
        memberId: member.id, activityLevel,
        calorieGoal: calorieGoal ? +calorieGoal : undefined,
      });
      setPlan(p);
      toast.success('บันทึกแผนโภชนาการแล้ว');
      setPreview(null);
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  const saveLog = async () => {
    if (!plan) return toast.error('ยังไม่มีแผนโภชนาการ');
    await nutritionApi.upsertLog(plan.id, { logDate, ...logData, caloriesConsumed: +logData.caloriesConsumed, proteinG: +logData.proteinG, fatG: +logData.fatG, carbG: +logData.carbG });
    toast.success('บันทึกแคลอรี่แล้ว');
  };

  const display = preview || plan;

  return (
    <div className="space-y-5">
      {/* TDEE Calculator */}
      <div className="card">
        <div className="card-header"><h3 className="font-semibold">🧮 คำนวณ TDEE & แมคโคร</h3></div>
        <div className="card-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ระดับกิจกรรม</label>
              <select className="input" value={activityLevel} onChange={e => setActivityLevel(e.target.value)}>
                {Object.entries(ACTIVITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">เป้าหมายแคลอรี่ (กำหนดเอง)</label>
              <input className="input" type="number" placeholder={`ปล่อยว่าง = ใช้ TDEE`} value={calorieGoal} onChange={e => setCalorieGoal(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={calculate} className="btn-secondary">คำนวณ</button>
            {(preview || plan) && <button onClick={savePlan} disabled={saving} className="btn-primary">{saving ? 'กำลังบันทึก...' : 'บันทึกแผน'}</button>}
          </div>

          {display && (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
              {[
                ['BMR', Math.round(display.bmr), 'kcal'],
                ['TDEE', Math.round(display.tdee), 'kcal'],
                ['เป้าหมาย', Math.round(display.targetCalories), 'kcal'],
                ['โปรตีน', Math.round(display.proteinG), 'g'],
                ['ไขมัน', Math.round(display.fatG), 'g'],
                ['คาร์บ', Math.round(display.carbG), 'g'],
              ].map(([label, val, unit]) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className="text-lg font-bold text-gray-900">{val}</div>
                  <div className="text-xs text-gray-400">{unit}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      {plan && chart && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-2">
            <div className="card-header"><h3 className="font-semibold">📈 แคลอรี่ 30 วันที่ผ่านมา</h3></div>
            <div className="card-body"><CalorieChart data={chart.logs} target={chart.target} /></div>
          </div>
          <div className="card">
            <div className="card-header"><h3 className="font-semibold">สัดส่วนแมคโคร</h3></div>
            <div className="card-body"><MacroPieChart plan={plan} /></div>
          </div>
        </div>
      )}

      {/* Daily log */}
      {plan && (
        <div className="card">
          <div className="card-header"><h3 className="font-semibold">📝 บันทึกแคลอรี่วันนี้</h3></div>
          <div className="card-body">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="label">วันที่</label>
                <input className="input" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
              </div>
              <div>
                <label className="label">แคลอรี่ทั้งหมด</label>
                <input className="input" type="number" placeholder={`เป้า: ${Math.round(plan.targetCalories)}`} value={logData.caloriesConsumed} onChange={e => setLogData(d => ({ ...d, caloriesConsumed: e.target.value }))} />
              </div>
              <div>
                <label className="label">โปรตีน (g)</label>
                <input className="input" type="number" value={logData.proteinG} onChange={e => setLogData(d => ({ ...d, proteinG: e.target.value }))} />
              </div>
              <div>
                <label className="label">ไขมัน (g)</label>
                <input className="input" type="number" value={logData.fatG} onChange={e => setLogData(d => ({ ...d, fatG: e.target.value }))} />
              </div>
              <div>
                <label className="label">คาร์บ (g)</label>
                <input className="input" type="number" value={logData.carbG} onChange={e => setLogData(d => ({ ...d, carbG: e.target.value }))} />
              </div>
            </div>
            <button onClick={saveLog} className="btn-primary mt-4">บันทึก</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ProgramsTab({ memberId, programs, setPrograms }: any) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const createProgram = async () => {
    if (!newName) return;
    const p = await programsApi.create({ memberId, name: newName, description: newDesc, days: [] });
    setPrograms((prev: Program[]) => [p, ...prev]);
    setCreating(false); setNewName(''); setNewDesc('');
    toast.success('สร้างโปรแกรมแล้ว');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setCreating(true)} className="btn-primary">+ สร้างโปรแกรม</button>
      </div>

      {creating && (
        <div className="card p-4 space-y-3 border-blue-200 bg-blue-50">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ชื่อโปรแกรม</label>
              <input className="input" placeholder="Week 1 Program" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="label">คำอธิบาย</label>
              <input className="input" placeholder="optional" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={createProgram} className="btn-primary btn-sm">บันทึก</button>
            <button onClick={() => setCreating(false)} className="btn-secondary btn-sm">ยกเลิก</button>
          </div>
        </div>
      )}

      {programs.length === 0 && !creating ? (
        <div className="text-center py-12 text-gray-400">ยังไม่มีโปรแกรม</div>
      ) : programs.map((p: Program) => (
        <div key={p.id} className="card">
          <div className="card-header">
            <div>
              <div className="font-semibold">{p.name}</div>
              {p.description && <div className="text-xs text-gray-400">{p.description}</div>}
            </div>
            <Link href={`/admin/programs/${p.id}`} className="btn-secondary btn-sm">แก้ไขโปรแกรม →</Link>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {p.days.map(d => (
                <span key={d.id} className="badge-blue">{d.title} ({d.exercises.length} ท่า)</span>
              ))}
              {p.days.length === 0 && <span className="text-sm text-gray-400">ยังไม่มีวัน</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SessionsTab({ sessions, setSessions, memberId }: any) {
  const start = async (id: string) => {
    await sessionsApi.start(id);
    setSessions((prev: Session[]) => prev.map(s => s.id === id ? { ...s, status: 'in_progress', startedAt: new Date().toISOString() } : s));
    toast.success('เริ่มเทรนแล้ว! ลดจำนวนครั้ง 1 ครั้ง');
  };
  const end = async (id: string) => {
    await sessionsApi.end(id);
    setSessions((prev: Session[]) => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
    toast.success('จบ Session แล้ว');
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="font-semibold">ประวัติ Session</h3>
        <span className="badge-blue">{sessions.length} รายการ</span>
      </div>
      <table className="table-base">
        <thead>
          <tr><th>วันที่นัด</th><th>เริ่ม</th><th>จบ</th><th>สถานะ</th><th>การดำเนินการ</th></tr>
        </thead>
        <tbody>
          {sessions.map((s: Session) => (
            <tr key={s.id}>
              <td>{dayjs(s.scheduledAt).format('DD/MM/YYYY HH:mm')}</td>
              <td>{s.startedAt ? dayjs(s.startedAt).format('HH:mm') : '-'}</td>
              <td>{s.endedAt ? dayjs(s.endedAt).format('HH:mm') : '-'}</td>
              <td><StatusBadge status={s.status} /></td>
              <td>
                <div className="flex gap-2">
                  {s.status === 'scheduled' && (
                    <button onClick={() => start(s.id)} className="btn btn-sm btn-success">🏋️ เริ่มเทรน</button>
                  )}
                  {s.status === 'in_progress' && (
                    <button onClick={() => end(s.id)} className="btn btn-sm btn-secondary">✅ จบ Session</button>
                  )}
                  {s.status === 'completed' && (
                    <Link href={`/admin/sessions/${s.id}`} className="btn btn-sm btn-ghost">ดู Workout Log</Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {sessions.length === 0 && (
            <tr><td colSpan={5} className="text-center py-8 text-gray-400">ยังไม่มี Session</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { scheduled: 'badge-amber', in_progress: 'badge-blue', completed: 'badge-green', cancelled: 'badge-red' };
  const labels: Record<string, string> = { scheduled: 'รอเทรน', in_progress: 'กำลังเทรน', completed: 'เสร็จแล้ว', cancelled: 'ยกเลิก' };
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>;
}
