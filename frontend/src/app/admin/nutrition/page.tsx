'use client';
import { useEffect, useState } from 'react';
import { membersApi, nutritionApi } from '@/lib/api';
import { Member, NutritionPlan, ActivityLevel, ACTIVITY_LABELS } from '@/types';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { MacroPieChart } from '@/components/charts/MacroPieChart';
import toast from 'react-hot-toast';

export default function NutritionPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { membersApi.list().then(setMembers); }, []);

  useEffect(() => {
    if (!selectedId) { setPlan(null); setChartData(null); return; }
    nutritionApi.getActivePlan(selectedId).then(setPlan).catch(() => setPlan(null));
    nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => setChartData(null));
  }, [selectedId]);

  const calculate = async () => {
    if (!selectedId) return toast.error('เลือกสมาชิกก่อน');
    try {
      const res = await nutritionApi.calculate({ memberId: selectedId, activityLevel: activity, calorieGoal: calorieGoal ? +calorieGoal : undefined });
      setPreview(res);
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const savePlan = async () => {
    if (!selectedId) return;
    setLoading(true);
    try {
      const p = await nutritionApi.createPlan({ memberId: selectedId, activityLevel: activity, calorieGoal: calorieGoal ? +calorieGoal : undefined });
      setPlan(p);
      setPreview(null);
      toast.success('บันทึกแผนโภชนาการแล้ว');
      nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => {});
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  const display = preview || plan;
  const selectedMember = members.find(m => m.id === selectedId);

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">โภชนาการ & TDEE</h1>
        <p className="text-sm text-gray-500 mt-1">คำนวณ BMR / TDEE และวางแผนโภชนาการรายบุคคล</p>
      </div>

      {/* Member selector */}
      <div className="card p-5">
        <label className="label">เลือกสมาชิก</label>
        <select className="input max-w-xs" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
          <option value="">— เลือกสมาชิก —</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        {selectedMember && (
          <div className="mt-3 flex gap-4 text-sm text-gray-500">
            <span>อายุ {selectedMember.age} ปี</span>
            <span>น้ำหนัก {selectedMember.weight} kg</span>
            <span>ส่วนสูง {selectedMember.height} cm</span>
            <span className="capitalize">{selectedMember.gender === 'male' ? 'ชาย' : 'หญิง'}</span>
          </div>
        )}
      </div>

      {/* Calculator */}
      <div className="card p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">🧮 คำนวณ TDEE</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">ระดับกิจกรรม</label>
            <select className="input" value={activity} onChange={e => setActivity(e.target.value as ActivityLevel)}>
              {(Object.entries(ACTIVITY_LABELS) as [ActivityLevel, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">เป้าหมายแคลอรี่ (ปล่อยว่าง = ใช้ TDEE)</label>
            <input className="input" type="number" placeholder="เช่น 1800" value={calorieGoal} onChange={e => setCalorieGoal(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={calculate} className="btn-secondary">คำนวณ</button>
          {display && (
            <button onClick={savePlan} disabled={loading} className="btn-primary">
              {loading ? 'กำลังบันทึก...' : '💾 บันทึกแผน'}
            </button>
          )}
        </div>

        {/* Result */}
        {display && (
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-2 pt-4 border-t border-gray-100">
            {([
              ['BMR', Math.round(+display.bmr), 'kcal', 'bg-slate-100 text-slate-700'],
              ['TDEE', Math.round(+display.tdee), 'kcal', 'bg-blue-100 text-blue-700'],
              ['เป้าหมาย', Math.round(+display.targetCalories), 'kcal', 'bg-indigo-100 text-indigo-700'],
              ['โปรตีน', Math.round(+display.proteinG), 'g', 'bg-red-100 text-red-700'],
              ['ไขมัน', Math.round(+display.fatG), 'g', 'bg-amber-100 text-amber-700'],
              ['คาร์บ', Math.round(+display.carbG), 'g', 'bg-emerald-100 text-emerald-700'],
            ] as [string, number, string, string][]).map(([label, val, unit, cls]) => (
              <div key={label} className={`rounded-xl p-3 text-center ${cls}`}>
                <div className="text-xs mb-1 opacity-70">{label}</div>
                <div className="text-xl font-bold">{val.toLocaleString()}</div>
                <div className="text-xs opacity-60">{unit}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active plan + charts */}
      {plan && (
        <>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card">
              <div className="card-header"><h3 className="font-semibold">แผนปัจจุบัน</h3></div>
              <div className="p-5"><MacroPieChart plan={plan} /></div>
            </div>
            {chartData?.logs?.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="font-semibold">📈 แคลอรี่ 30 วันที่ผ่านมา</h3>
                  <span className="text-xs text-gray-400">เป้า: {Math.round(+plan.targetCalories).toLocaleString()} kcal</span>
                </div>
                <div className="p-5">
                  <CalorieChart data={chartData.logs} target={+plan.targetCalories} />
                </div>
              </div>
            )}
          </div>

          {/* Daily log entry */}
          <DailyLogEntry plan={plan} onSaved={() => {
            nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => {});
          }} />
        </>
      )}
    </div>
  );
}

function DailyLogEntry({ plan, onSaved }: { plan: NutritionPlan; onSaved: () => void }) {
  const today = new Date().toISOString().split('T')[0];
  const [logDate, setLogDate] = useState(today);
  const [data, setData] = useState({ caloriesConsumed: '', proteinG: '', fatG: '', carbG: '', notes: '' });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await nutritionApi.upsertLog(plan.id, {
        logDate,
        caloriesConsumed: +data.caloriesConsumed || 0,
        proteinG: +data.proteinG || 0,
        fatG: +data.fatG || 0,
        carbG: +data.carbG || 0,
        notes: data.notes,
      });
      toast.success('บันทึกแคลอรี่แล้ว');
      onSaved();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setSaving(false); }
  };

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-semibold text-gray-800">📝 บันทึกแคลอรี่รายวัน</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="label">วันที่</label>
          <input className="input" type="date" value={logDate} onChange={e => setLogDate(e.target.value)} />
        </div>
        <div>
          <label className="label">แคลอรี่รวม (เป้า: {Math.round(+plan.targetCalories)})</label>
          <input className="input" type="number" placeholder={String(Math.round(+plan.targetCalories))}
            value={data.caloriesConsumed} onChange={e => setData(d => ({ ...d, caloriesConsumed: e.target.value }))} />
        </div>
        <div>
          <label className="label">โปรตีน g (เป้า: {Math.round(+plan.proteinG)}g)</label>
          <input className="input" type="number" value={data.proteinG} onChange={e => setData(d => ({ ...d, proteinG: e.target.value }))} />
        </div>
        <div>
          <label className="label">ไขมัน g (เป้า: {Math.round(+plan.fatG)}g)</label>
          <input className="input" type="number" value={data.fatG} onChange={e => setData(d => ({ ...d, fatG: e.target.value }))} />
        </div>
        <div>
          <label className="label">คาร์บ g (เป้า: {Math.round(+plan.carbG)}g)</label>
          <input className="input" type="number" value={data.carbG} onChange={e => setData(d => ({ ...d, carbG: e.target.value }))} />
        </div>
        <div>
          <label className="label">หมายเหตุ</label>
          <input className="input" value={data.notes} onChange={e => setData(d => ({ ...d, notes: e.target.value }))} />
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
      </button>
    </div>
  );
}
