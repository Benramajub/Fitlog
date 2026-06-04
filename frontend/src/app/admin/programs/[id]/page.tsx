'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { programsApi, membersApi } from '@/lib/api';
import { Program, ProgramDay, ProgramExercise, Member } from '@/types';
import toast from 'react-hot-toast';
import Link from 'next/link';

// ── helpers ──────────────────────────────────────────────
function calcVolume(w = 0, s = 0, r = 0) { return w * s * r; }

function calcIntensity(rpe?: number, rir?: number): { label: string; color: string; pct: number } {
  // If RPE given use it; else estimate from RIR (RPE ≈ 10 - RIR)
  const effectiveRpe = rpe ?? (rir !== undefined ? 10 - rir : undefined);
  if (effectiveRpe === undefined) return { label: '-', color: 'bg-gray-200', pct: 0 };
  if (effectiveRpe >= 9.5) return { label: 'สูงมาก (Max)', color: 'bg-red-500', pct: 100 };
  if (effectiveRpe >= 8.5) return { label: 'สูง (Hard)', color: 'bg-orange-500', pct: 80 };
  if (effectiveRpe >= 7.5) return { label: 'ปานกลาง', color: 'bg-yellow-500', pct: 60 };
  if (effectiveRpe >= 6)   return { label: 'เบา', color: 'bg-green-500', pct: 40 };
  return { label: 'อบอุ่นร่างกาย', color: 'bg-blue-400', pct: 20 };
}

const EMPTY_FORM: Partial<ProgramExercise> = {
  exerciseName: '', defaultWeight: undefined,
  defaultSets: 0, defaultReps: 0, defaultRir: 0, defaultRpe: 0, notes: '',
};

// ── Main Page ─────────────────────────────────────────────
export default function ProgramBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [program, setProgram] = useState<Program | null>(null);
  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingDay, setAddingDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [activeDay, setActiveDay] = useState<string | null>(null);

  const load = useCallback(async () => {
    const p = await programsApi.get(id);
    setProgram(p);
    if (p.days?.length > 0 && !activeDay) setActiveDay(p.days[0].id);
    if (p.memberId) {
      membersApi.get(p.memberId).then(setMember).catch(() => {});
    }
    setLoading(false);
  }, [id, activeDay]);

  useEffect(() => { load(); }, [id]);

  const addDay = async () => {
    if (!newDayTitle.trim()) return;
    await programsApi.addDay(id, { title: newDayTitle, dayOrder: (program?.days?.length || 0) + 1 });
    toast.success(`เพิ่ม "${newDayTitle}" แล้ว`);
    setNewDayTitle(''); setAddingDay(false);
    load();
  };

  const removeDay = async (dayId: string, title: string) => {
    if (!confirm(`ลบวัน "${title}" และท่าทั้งหมด?`)) return;
    // delete all exercises in day then delete day via API if supported
    // For now use a workaround: update title to mark deleted then refresh
    toast.error('ฟีเจอร์ลบวันยังไม่รองรับ กรุณาลบท่าทั้งหมดออกก่อน');
  };

  if (loading || !program) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const currentDay = program.days?.find(d => d.id === activeDay) || null;
  const totalExercises = program.days?.reduce((a, d) => a + (d.exercises?.length || 0), 0) || 0;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href="/admin/programs" className="btn-ghost btn-sm mt-1">← กลับ</Link>
        <div className="flex-1">
          <h1 className="page-title">{program.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            {member && (
              <span className="text-sm text-gray-500">
                👤 <span className="font-medium text-gray-700">{member.name}</span>
              </span>
            )}
            {program.description && (
              <span className="text-sm text-gray-400">• {program.description}</span>
            )}
            <span className="badge-blue">{program.days?.length || 0} วัน</span>
            <span className="badge-purple">{totalExercises} ท่า</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-5 items-start">
        {/* ── Day Sidebar ── */}
        <div className="space-y-2 sticky top-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">วันเทรน</div>

          {program.days?.sort((a, b) => a.dayOrder - b.dayOrder).map(d => {
            const dayVol = d.exercises?.reduce((sum, ex) =>
              sum + calcVolume(ex.defaultWeight, ex.defaultSets, ex.defaultReps), 0) || 0;
            return (
              <button key={d.id} onClick={() => setActiveDay(d.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  activeDay === d.id
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 shadow-sm'
                }`}>
                <div className="font-semibold text-sm">{d.title}</div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-400">{d.exercises?.length || 0} ท่า</span>
                  {dayVol > 0 && <span className="text-xs text-gray-400">{dayVol.toLocaleString()} kg vol</span>}
                </div>
              </button>
            );
          })}

          {/* Add day */}
          {addingDay ? (
            <div className="space-y-2 bg-white border border-blue-200 rounded-xl p-3">
              <input
                className="input text-sm"
                placeholder="Upper Body / Lower Body / Full Body"
                value={newDayTitle}
                onChange={e => setNewDayTitle(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addDay()}
                autoFocus
              />
              <div className="grid grid-cols-2 gap-1">
                {['Upper Body','Lower Body','Push Day','Pull Day','Leg Day','Full Body','Cardio','Rest Day'].map(t => (
                  <button key={t} onClick={() => setNewDayTitle(t)}
                    className="text-xs px-2 py-1 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded border border-gray-200 text-left transition-colors">
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={addDay} className="btn-primary btn-sm flex-1">+ เพิ่ม</button>
                <button onClick={() => { setAddingDay(false); setNewDayTitle(''); }} className="btn-secondary btn-sm">×</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAddingDay(true)}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-sm text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
              + เพิ่มวันเทรน
            </button>
          )}
        </div>

        {/* ── Exercise Editor ── */}
        <div>
          {currentDay
            ? <ExerciseEditor day={currentDay} onRefresh={load} />
            : (
              <div className="card flex flex-col items-center justify-center h-64 text-gray-400 gap-2">
                <div className="text-5xl">🏋️</div>
                <div>เลือกวันเทรนทางซ้าย หรือเพิ่มวันใหม่</div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ── Exercise Editor ───────────────────────────────────────
function ExerciseEditor({ day, onRefresh }: { day: ProgramDay; onRefresh: () => void }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleVal, setTitleVal] = useState(day.title);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<ProgramExercise>>({ ...EMPTY_FORM });

  // sync title when day changes
  useEffect(() => { setTitleVal(day.title); setEditingTitle(false); setAdding(false); setEditingId(null); }, [day.id]);

  const resetForm = () => setForm({ ...EMPTY_FORM });
  const setF = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const saveTitle = async () => {
    if (!titleVal.trim()) return;
    await programsApi.updateDay(day.id, titleVal);
    setEditingTitle(false); onRefresh();
  };

  const addExercise = async () => {
    if (!form.exerciseName?.trim()) return toast.error('กรอกชื่อท่าด้วย');
    await programsApi.addExercise(day.id, form);
    toast.success('เพิ่มท่าแล้ว');
    setAdding(false); resetForm(); onRefresh();
  };

  const updateExercise = async (exId: string) => {
    await programsApi.updateExercise(exId, form);
    toast.success('บันทึกแล้ว');
    setEditingId(null); resetForm(); onRefresh();
  };

  const removeExercise = async (exId: string, name: string) => {
    if (!confirm(`ลบท่า "${name}"?`)) return;
    await programsApi.removeExercise(exId);
    toast.success('ลบแล้ว'); onRefresh();
  };

  const startEdit = (ex: ProgramExercise) => {
    setEditingId(ex.id);
    setAdding(false);
    setForm({
      exerciseName: ex.exerciseName,
      defaultWeight: ex.defaultWeight,
      defaultSets: ex.defaultSets,
      defaultReps: ex.defaultReps,
      defaultRir: ex.defaultRir,
      defaultRpe: ex.defaultRpe,
      notes: ex.notes,
    });
  };

  const exercises = [...(day.exercises || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  // Summary stats
  const totalVolume = exercises.reduce((s, e) =>
    s + calcVolume(e.defaultWeight, e.defaultSets, e.defaultReps), 0);
  const avgRpe = exercises.filter(e => e.defaultRpe).reduce((s, e, _, arr) =>
    s + (e.defaultRpe || 0) / arr.length, 0);

  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="card">
        <div className="card-header">
          <div className="flex items-center gap-3">
            {editingTitle ? (
              <div className="flex gap-2 items-center">
                <input className="input text-base font-semibold w-56" value={titleVal}
                  onChange={e => setTitleVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                  autoFocus />
                <button onClick={saveTitle} className="btn-primary btn-sm">บันทึก</button>
                <button onClick={() => setEditingTitle(false)} className="btn-secondary btn-sm">×</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900">{day.title}</h2>
                <button onClick={() => setEditingTitle(true)} className="text-gray-300 hover:text-gray-500 transition-colors" title="แก้ไขชื่อ">✏️</button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-4 text-sm text-gray-500">
              <span>🏋️ {exercises.length} ท่า</span>
              <span>📦 Volume: <strong className="text-gray-800">{totalVolume.toLocaleString()} kg</strong></span>
              {avgRpe > 0 && <span>🔥 RPE เฉลี่ย: <strong className="text-gray-800">{avgRpe.toFixed(1)}</strong></span>}
            </div>
            <button onClick={() => { setAdding(v => !v); resetForm(); setEditingId(null); }} className="btn-primary btn-sm">
              {adding ? '× ปิด' : '+ เพิ่มท่า'}
            </button>
          </div>
        </div>

        {/* Add form */}
        {adding && (
          <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">เพิ่มท่าใหม่</div>
            <ExerciseForm form={form} setF={setF} />
            <div className="flex gap-2 mt-4">
              <button onClick={addExercise} className="btn-primary">💾 บันทึกท่า</button>
              <button onClick={() => { setAdding(false); resetForm(); }} className="btn-secondary">ยกเลิก</button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-6">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ท่าออกกำลังกาย</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">น้ำหนัก</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Set</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Reps</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">RIR</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">RPE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Volume</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">ความเข้มข้น</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">หมายเหตุ</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex, idx) => {
                const vol = calcVolume(ex.defaultWeight, ex.defaultSets, ex.defaultReps);
                const intensity = calcIntensity(ex.defaultRpe, ex.defaultRir);
                return editingId === ex.id ? (
                  <tr key={ex.id} className="bg-amber-50 border-b border-amber-100">
                    <td colSpan={11} className="px-4 py-4">
                      <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">
                        แก้ไข: {ex.exerciseName}
                      </div>
                      <ExerciseForm form={form} setF={setF} />
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => updateExercise(ex.id)} className="btn-primary btn-sm">💾 บันทึก</button>
                        <button onClick={() => { setEditingId(null); resetForm(); }} className="btn-secondary btn-sm">ยกเลิก</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={ex.id} className="hover:bg-gray-50 transition-colors border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-900">{ex.exerciseName}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ex.defaultWeight ? (
                        <span className="font-mono font-semibold text-gray-800">{ex.defaultWeight}<span className="text-xs text-gray-400 ml-1">kg</span></span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-blue-700">{ex.defaultSets ?? '-'}</td>
                    <td className="px-4 py-3 text-center font-mono font-semibold text-indigo-700">{ex.defaultReps ?? '-'}</td>
                    <td className="px-4 py-3 text-center">
                      {ex.defaultRir !== undefined ? (
                        <span className="badge-gray">RIR {ex.defaultRir}</span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {ex.defaultRpe !== undefined ? (
                        <RpeBadge rpe={ex.defaultRpe} />
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {vol > 0 ? (
                        <span className="font-mono font-semibold text-purple-700">
                          {vol.toLocaleString()}<span className="text-xs text-gray-400 ml-1">kg</span>
                        </span>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3">
                      {intensity.pct > 0 ? (
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${intensity.color}`} style={{ width: `${intensity.pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">{intensity.label}</span>
                        </div>
                      ) : <span className="text-gray-300">-</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 max-w-[140px] truncate">{ex.notes || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button onClick={() => startEdit(ex)} title="แก้ไข"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          ✏️
                        </button>
                        <button onClick={() => removeExercise(ex.id, ex.exerciseName)} title="ลบ"
                          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {exercises.length === 0 && !adding && (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    <div className="text-3xl mb-2">🏋️</div>
                    <div>ยังไม่มีท่า กด <strong>+ เพิ่มท่า</strong> เพื่อเริ่ม</div>
                  </td>
                </tr>
              )}

              {/* Summary row */}
              {exercises.length > 0 && (
                <tr className="bg-gray-50 border-t-2 border-gray-200">
                  <td className="px-4 py-3" />
                  <td className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">รวม</td>
                  <td />
                  <td className="px-4 py-3 text-center text-xs font-semibold text-blue-700">
                    {exercises.reduce((s, e) => s + (e.defaultSets || 0), 0)} sets
                  </td>
                  <td />
                  <td colSpan={3} className="px-4 py-3 text-center">
                    <span className="font-mono font-bold text-purple-700 text-sm">
                      Total: {totalVolume.toLocaleString()} kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {avgRpe > 0 && (
                      <span className="text-xs text-gray-500">RPE เฉลี่ย: <strong>{avgRpe.toFixed(1)}</strong></span>
                    )}
                  </td>
                  <td colSpan={2} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── RPE Badge ────────────────────────────────────────────
function RpeBadge({ rpe }: { rpe: number }) {
  const color = rpe >= 9 ? 'bg-red-100 text-red-700' :
                rpe >= 8 ? 'bg-orange-100 text-orange-700' :
                rpe >= 7 ? 'bg-yellow-100 text-yellow-700' :
                           'bg-green-100 text-green-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${color}`}>{rpe}</span>;
}

// ── Exercise Form ─────────────────────────────────────────
function ExerciseForm({ form, setF }: { form: Partial<ProgramExercise>; setF: (k: string, v: any) => void }) {
  const vol = calcVolume(form.defaultWeight, form.defaultSets, form.defaultReps);
  const intensity = calcIntensity(form.defaultRpe, form.defaultRir);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Exercise name */}
        <div className="md:col-span-3">
          <label className="label">ชื่อท่าออกกำลังกาย *</label>
          <div className="flex gap-2">
            <input className="input" placeholder="เช่น Barbell Squat, Bench Press, Lat Pulldown"
              value={form.exerciseName || ''} onChange={e => setF('exerciseName', e.target.value)} autoFocus />
          </div>
          {/* Quick pick */}
          <div className="flex flex-wrap gap-1 mt-2">
            {['Barbell Squat','Bench Press','Deadlift','Overhead Press','Barbell Row',
              'Lat Pulldown','Leg Press','Romanian Deadlift','Incline Press','Cable Row',
              'Bicep Curl','Tricep Pushdown','Leg Curl','Calf Raise','Pull Up'].map(t => (
              <button key={t} type="button" onClick={() => setF('exerciseName', t)}
                className="text-xs px-2 py-0.5 bg-white border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Weight */}
        <div>
          <label className="label">น้ำหนัก (kg)</label>
          <input className="input" type="number" step="2.5" min="0" placeholder="0"
            value={form.defaultWeight || ''} onChange={e => setF('defaultWeight', e.target.value ? +e.target.value : undefined)} />
        </div>
        {/* Sets */}
        <div>
          <label className="label">จำนวนเซ็ต (Set)</label>
          <input className="input" type="number" min="1" max="10"
            value={form.defaultSets || ''} onChange={e => setF('defaultSets', +e.target.value || 0)} />
        </div>
        {/* Reps */}
        <div>
          <label className="label">จำนวนครั้ง (Reps)</label>
          <input className="input" type="number" min="1" max="100"
            value={form.defaultReps || ''} onChange={e => setF('defaultReps', +e.target.value || 0)} />
        </div>
        {/* RIR */}
        <div>
          <label className="label">RIR (แรงที่เหลือ)</label>
          <select className="input" value={form.defaultRir ?? ''} onChange={e => setF('defaultRir', e.target.value !== '' ? +e.target.value : undefined)}>
            <option value="">- ไม่ระบุ -</option>
            {[0,1,2,3,4,5].map(v => <option key={v} value={v}>{v} ({v === 0 ? 'Failure' : v === 1 ? 'เกือบสุด' : v === 2 ? 'ยังพอมีแรง' : v >= 3 ? 'มีแรงเหลือมาก' : ''})</option>)}
          </select>
        </div>
        {/* RPE */}
        <div>
          <label className="label">RPE (ความเหนื่อย 1-10)</label>
          <select className="input" value={form.defaultRpe ?? ''} onChange={e => setF('defaultRpe', e.target.value !== '' ? +e.target.value : undefined)}>
            <option value="">- ไม่ระบุ -</option>
            {[6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10].map(v => (
              <option key={v} value={v}>RPE {v} — {
                v >= 10 ? 'Maximal / ล้มเหลว' :
                v >= 9  ? 'Very Hard / เกือบ max' :
                v >= 8  ? 'Hard / หนักมาก' :
                v >= 7  ? 'Moderate / พอดี' :
                          'Easy / เบา'
              }</option>
            ))}
          </select>
        </div>
        {/* Notes */}
        <div>
          <label className="label">หมายเหตุ</label>
          <input className="input" placeholder="เช่น ระวังเข่า, ควบคุมจังหวะ"
            value={form.notes || ''} onChange={e => setF('notes', e.target.value)} />
        </div>
      </div>

      {/* Live preview */}
      {(vol > 0 || intensity.pct > 0) && (
        <div className="flex flex-wrap gap-4 p-3 bg-white rounded-xl border border-gray-200">
          {vol > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Volume:</span>
              <span className="font-mono font-bold text-purple-700">{vol.toLocaleString()} kg</span>
              <span className="text-xs text-gray-400">({form.defaultWeight}kg × {form.defaultSets}set × {form.defaultReps}reps)</span>
            </div>
          )}
          {intensity.pct > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">ความเข้มข้น:</span>
              <div className="flex items-center gap-1.5">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${intensity.color} transition-all`} style={{ width: `${intensity.pct}%` }} />
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  intensity.color.includes('red') ? 'bg-red-100 text-red-700' :
                  intensity.color.includes('orange') ? 'bg-orange-100 text-orange-700' :
                  intensity.color.includes('yellow') ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>{intensity.label}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}