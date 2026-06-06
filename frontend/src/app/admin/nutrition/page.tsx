'use client';
import { useEffect, useState } from 'react';
import { membersApi, nutritionApi } from '@/lib/api';
import { Member, NutritionPlan, ActivityLevel, ACTIVITY_LABELS } from '@/types';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { MacroPieChart } from '@/components/charts/MacroPieChart';
import toast from 'react-hot-toast';

// ─── Preset macro ratios ────────────────────────────────────────
const PRESETS = [
  { label: 'LBM Based',     desc: 'โปรตีนจาก LBM (แนะนำ)',       mode: 'lbm' as const, p: 0,  f: 0,  c: 0  },
  { label: 'Balanced',      desc: 'โปรตีน 30 / ไขมัน 30 / คาร์บ 40', mode: 'ratio' as const, p: 30, f: 30, c: 40 },
  { label: 'High Protein',  desc: 'โปรตีน 40 / ไขมัน 25 / คาร์บ 35', mode: 'ratio' as const, p: 40, f: 25, c: 35 },
  { label: 'Low Carb',      desc: 'โปรตีน 35 / ไขมัน 40 / คาร์บ 25', mode: 'ratio' as const, p: 35, f: 40, c: 25 },
  { label: 'Keto',          desc: 'โปรตีน 25 / ไขมัน 65 / คาร์บ 10', mode: 'ratio' as const, p: 25, f: 65, c: 10 },
  { label: 'Classic',       desc: 'โปรตีน 25 / ไขมัน 25 / คาร์บ 50', mode: 'ratio' as const, p: 25, f: 25, c: 50 },
  { label: 'Custom',        desc: 'กำหนดเองได้เลย',                 mode: 'ratio' as const, p: 0,  f: 0,  c: 0  },
];

type MacroMode = 'lbm' | 'ratio';

export default function NutritionPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [activity, setActivity] = useState<ActivityLevel>('moderate');
  const [calorieGoal, setCalorieGoal] = useState('');
  const [macroMode, setMacroMode] = useState<MacroMode>('lbm');
  const [selectedPreset, setSelectedPreset] = useState(0); // index into PRESETS
  const [customP, setCustomP] = useState('25');
  const [customF, setCustomF] = useState('25');
  const [customC, setCustomC] = useState('50');
  const [preview, setPreview] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { membersApi.list().then(setMembers); }, []);

  useEffect(() => {
    if (!selectedId) { setPlan(null); setChartData(null); setPreview(null); return; }
    nutritionApi.getActivePlan(selectedId).then(p => { setPlan(p); setPreview(null); }).catch(() => setPlan(null));
    nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => setChartData(null));
  }, [selectedId]);

  // ── Ratio validation ──────────────────────────────────────────
  const total = macroMode === 'lbm' ? 100 : +customP + +customF + +customC;
  const ratioValid = macroMode === 'lbm' || total === 100;

  const getMacroRatios = () => {
    if (macroMode === 'lbm') return undefined;
    const preset = PRESETS[selectedPreset];
    if (preset.mode === 'ratio' && preset.label !== 'Custom') {
      return { proteinPct: preset.p, fatPct: preset.f, carbPct: preset.c };
    }
    return { proteinPct: +customP, fatPct: +customF, carbPct: +customC };
  };

  const calculate = async () => {
    if (!selectedId) return toast.error('เลือกสมาชิกก่อน');
    if (!ratioValid) return toast.error('สัดส่วนต้องรวมกันได้ 100%');
    try {
      const res = await nutritionApi.calculate({
        memberId: selectedId,
        activityLevel: activity,
        calorieGoal: calorieGoal ? +calorieGoal : undefined,
        macroMode,
        macroRatios: getMacroRatios(),
      });
      setPreview(res);
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const savePlan = async () => {
    if (!selectedId || !ratioValid) return;
    setLoading(true);
    try {
      const p = await nutritionApi.createPlan({
        memberId: selectedId,
        activityLevel: activity,
        calorieGoal: calorieGoal ? +calorieGoal : undefined,
        macroMode,
        macroRatios: getMacroRatios(),
      });
      setPlan(p); setPreview(null);
      toast.success('บันทึกแผนโภชนาการแล้ว');
      nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => {});
    } catch { toast.error('เกิดข้อผิดพลาด'); }
    finally { setLoading(false); }
  };

  // When preset changes
  const pickPreset = (idx: number) => {
    setSelectedPreset(idx);
    const p = PRESETS[idx];
    if (p.mode === 'lbm') {
      setMacroMode('lbm');
    } else {
      setMacroMode('ratio');
      if (p.label !== 'Custom') {
        setCustomP(String(p.p));
        setCustomF(String(p.f));
        setCustomC(String(p.c));
      }
    }
    setPreview(null);
  };

  // Auto-balance carb when protein/fat changes
  const handleCustomChange = (field: 'p' | 'f' | 'c', val: string) => {
    const n = Math.min(100, Math.max(0, +val || 0));
    if (field === 'p') {
      setCustomP(String(n));
      const remaining = 100 - n - +customF;
      if (remaining >= 0) setCustomC(String(remaining));
    } else if (field === 'f') {
      setCustomF(String(n));
      const remaining = 100 - +customP - n;
      if (remaining >= 0) setCustomC(String(remaining));
    } else {
      setCustomC(String(n));
    }
    setSelectedPreset(6); // switch to Custom
    setPreview(null);
  };

  const display = preview || (plan as any);
  const selectedMember = members.find(m => m.id === selectedId);
  const isCustom = selectedPreset === 6 || (macroMode === 'ratio' && PRESETS[selectedPreset].label === 'Custom');

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="page-title">โภชนาการ & TDEE</h1>
        <p className="text-sm text-gray-500 mt-1">คำนวณ LBM → BMR → TDEE และวางแผนสัดส่วนมาโคร</p>
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
            <span>{selectedMember.gender === 'male' ? '♂ ชาย' : '♀ หญิง'}</span>
          </div>
        )}
      </div>

      {/* Calculator */}
      <div className="card p-5 space-y-5">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">🧮 คำนวณ TDEE & Macros</h2>
        </div>

        {/* Formula info */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-3 text-sm text-teal-800 flex flex-wrap gap-x-2 gap-y-1">
          <span>① <strong>LBM</strong> (Boer Formula)</span>
          <span className="text-teal-400">→</span>
          <span>② <strong>BMR</strong> = 370 + (21.6 × LBM)</span>
          <span className="text-teal-400">→</span>
          <span>③ <strong>TDEE</strong> = BMR × Activity</span>
          <span className="text-teal-400">→</span>
          <span>④ คำนวณ <strong>Macros</strong></span>
          <span className="ml-2 text-teal-600 text-xs">Katch-McArdle ✓</span>
        </div>

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
            <label className="label">เป้าหมายแคลอรี่ <span className="text-gray-400 normal-case font-normal">(ปล่อยว่าง = ใช้ TDEE)</span></label>
            <input className="input" type="number" placeholder="เช่น 1800"
              value={calorieGoal} onChange={e => setCalorieGoal(e.target.value)} />
          </div>
        </div>

        {/* ── Macro ratio selector ── */}
        <div>
          <label className="label mb-3">สัดส่วนมาโครนิวเทรียน</label>

          {/* Preset buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => pickPreset(i)}
                className={`flex flex-col items-center text-center px-3 py-3 rounded-xl border-2 transition-all ${
                  selectedPreset === i
                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                }`}
              >
                <span className="font-bold text-sm">{p.label}</span>
                {p.mode === 'lbm' ? (
                  <span className="text-xs mt-1 opacity-60">LBM-based</span>
                ) : p.label === 'Custom' ? (
                  <span className="text-xs mt-1 opacity-60">กำหนดเอง</span>
                ) : (
                  <span className="text-xs mt-1 opacity-60">{p.p}/{p.f}/{p.c}</span>
                )}
                <span className="text-xs mt-0.5 opacity-50 leading-tight hidden md:block">{p.desc.split('/')[0].replace('โปรตีน ','P').replace('ไขมัน ','F').replace('คาร์บ ','C')}</span>
              </button>
            ))}
          </div>

          {/* Ratio inputs — show when ratio mode */}
          {macroMode === 'ratio' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">กำหนดสัดส่วน (%)</span>
                <span className={`text-sm font-bold ${total === 100 ? 'text-emerald-600' : total > 100 ? 'text-red-500' : 'text-amber-500'}`}>
                  รวม: {total}% {total === 100 ? '✓' : total > 100 ? '(เกิน)' : `(ขาด ${100 - total}%)`}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Protein */}
                <div>
                  <label className="label text-red-600">🥩 โปรตีน</label>
                  <div className="relative">
                    <input className="input pr-8 text-center font-bold text-red-700"
                      type="number" min="0" max="100"
                      value={customP}
                      onChange={e => handleCustomChange('p', e.target.value)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full transition-all" style={{ width: `${Math.min(100, +customP)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {display ? `≈ ${Math.round((+display.targetCalories * (+customP / 100)) / 4)}g` : ''}
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <label className="label text-amber-600">🫙 ไขมัน</label>
                  <div className="relative">
                    <input className="input pr-8 text-center font-bold text-amber-700"
                      type="number" min="0" max="100"
                      value={customF}
                      onChange={e => handleCustomChange('f', e.target.value)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${Math.min(100, +customF)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {display ? `≈ ${Math.round((+display.targetCalories * (+customF / 100)) / 9)}g` : ''}
                  </div>
                </div>

                {/* Carb */}
                <div>
                  <label className="label text-emerald-600">🌾 คาร์บ</label>
                  <div className="relative">
                    <input className="input pr-8 text-center font-bold text-emerald-700"
                      type="number" min="0" max="100"
                      value={customC}
                      onChange={e => handleCustomChange('c', e.target.value)} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                  </div>
                  <div className="mt-1.5 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${Math.min(100, +customC)}%` }} />
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {display ? `≈ ${Math.round((+display.targetCalories * (+customC / 100)) / 4)}g` : ''}
                  </div>
                </div>
              </div>

              {/* Stacked bar visualization */}
              <div>
                <div className="text-xs text-gray-400 mb-1">ภาพรวมสัดส่วน</div>
                <div className="h-5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-400 transition-all flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${+customP}%` }}>
                    {+customP >= 10 ? `${customP}%` : ''}
                  </div>
                  <div className="h-full bg-amber-400 transition-all flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${+customF}%` }}>
                    {+customF >= 10 ? `${customF}%` : ''}
                  </div>
                  <div className="h-full bg-emerald-400 transition-all flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${+customC}%` }}>
                    {+customC >= 10 ? `${customC}%` : ''}
                  </div>
                  {total < 100 && (
                    <div className="h-full bg-gray-200 flex-1 flex items-center justify-center text-gray-400 text-xs">
                      {100 - total}%
                    </div>
                  )}
                </div>
                <div className="flex gap-3 mt-1.5 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block"/>โปรตีน</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block"/>ไขมัน</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"/>คาร์บ</span>
                </div>
              </div>
            </div>
          )}

          {macroMode === 'lbm' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              ✨ <strong>LBM-based:</strong> โปรตีน = LBM × 1.6 | ไขมัน = 25% TDEE | คาร์บ = พลังงานที่เหลือ
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={calculate} disabled={!ratioValid} className="btn-secondary">
            🔍 คำนวณ
          </button>
          {display && (
            <button onClick={savePlan} disabled={loading || !ratioValid} className="btn-primary">
              {loading ? 'กำลังบันทึก...' : '💾 บันทึกแผน'}
            </button>
          )}
          {!ratioValid && (
            <span className="self-center text-sm text-red-500">สัดส่วนต้องรวมกันได้ 100% (ตอนนี้ {total}%)</span>
          )}
        </div>

        {/* Result cards */}
        {display && (
          <div className="pt-4 border-t border-gray-100 space-y-4">
            {/* Step indicators */}
            <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
              {[
                { label: 'LBM',        val: display.lbm ? (+display.lbm).toFixed(1) : '-', unit: 'kg',  cls: 'bg-teal-100 text-teal-800 border-teal-200' },
                { label: 'BMR',        val: Math.round(+display.bmr).toLocaleString(),       unit: 'kcal', cls: 'bg-slate-100 text-slate-700 border-slate-200' },
                { label: 'TDEE',       val: Math.round(+display.tdee).toLocaleString(),      unit: 'kcal', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
                { label: 'เป้าหมาย', val: Math.round(+display.targetCalories).toLocaleString(), unit: 'kcal', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
                { label: 'โปรตีน',   val: Math.round(+display.proteinG),                   unit: 'g',    cls: 'bg-red-100 text-red-700 border-red-200' },
                { label: 'ไขมัน',    val: Math.round(+display.fatG),                       unit: 'g',    cls: 'bg-amber-100 text-amber-700 border-amber-200' },
                { label: 'คาร์บ',    val: Math.round(+display.carbG),                      unit: 'g',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
              ].map(({ label, val, unit, cls }) => (
                <div key={label} className={`rounded-xl p-3 text-center border ${cls}`}>
                  <div className="text-xs mb-1 opacity-70 font-medium">{label}</div>
                  <div className="text-lg font-bold">{val}</div>
                  <div className="text-xs opacity-60">{unit}</div>
                </div>
              ))}
            </div>

            {/* Actual % breakdown */}
            {display.proteinPct && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 whitespace-nowrap">สัดส่วนจริง:</span>
                <div className="flex-1 h-5 rounded-full overflow-hidden flex">
                  <div className="h-full bg-red-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{ width: `${display.proteinPct}%` }}>
                    {display.proteinPct >= 10 ? `${display.proteinPct}%` : ''}
                  </div>
                  <div className="h-full bg-amber-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{ width: `${display.fatPct}%` }}>
                    {display.fatPct >= 10 ? `${display.fatPct}%` : ''}
                  </div>
                  <div className="h-full bg-emerald-400 flex items-center justify-center text-white text-xs font-bold transition-all"
                    style={{ width: `${display.carbPct}%` }}>
                    {display.carbPct >= 10 ? `${display.carbPct}%` : ''}
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  P {display.proteinPct}% / F {display.fatPct}% / C {display.carbPct}%
                </span>
              </div>
            )}
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
          <DailyLogEntry plan={plan} onSaved={() => {
            nutritionApi.getChart(selectedId, 30).then(setChartData).catch(() => {});
          }} />
        </>
      )}
    </div>
  );
}

// ─── Daily Log Entry ──────────────────────────────────────────
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
          <label className="label">แคลอรี่รวม <span className="text-gray-400">(เป้า: {Math.round(+plan.targetCalories)})</span></label>
          <input className="input" type="number" value={data.caloriesConsumed}
            onChange={e => setData(d => ({ ...d, caloriesConsumed: e.target.value }))} />
        </div>
        <div>
          <label className="label">โปรตีน g <span className="text-gray-400">(เป้า: {Math.round(+plan.proteinG)}g)</span></label>
          <input className="input" type="number" value={data.proteinG}
            onChange={e => setData(d => ({ ...d, proteinG: e.target.value }))} />
        </div>
        <div>
          <label className="label">ไขมัน g <span className="text-gray-400">(เป้า: {Math.round(+plan.fatG)}g)</span></label>
          <input className="input" type="number" value={data.fatG}
            onChange={e => setData(d => ({ ...d, fatG: e.target.value }))} />
        </div>
        <div>
          <label className="label">คาร์บ g <span className="text-gray-400">(เป้า: {Math.round(+plan.carbG)}g)</span></label>
          <input className="input" type="number" value={data.carbG}
            onChange={e => setData(d => ({ ...d, carbG: e.target.value }))} />
        </div>
        <div>
          <label className="label">หมายเหตุ</label>
          <input className="input" value={data.notes}
            onChange={e => setData(d => ({ ...d, notes: e.target.value }))} />
        </div>
      </div>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
      </button>
    </div>
  );
}