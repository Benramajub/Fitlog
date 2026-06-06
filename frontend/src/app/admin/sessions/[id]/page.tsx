"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  sessionsApi,
  workoutLogsApi,
  programsApi,
  membersApi,
} from "@/lib/api";
import { Session, WorkoutLog, Program, ProgramDay } from "@/types";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
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
  fromProgram: boolean;
}

function calcVol(w: string, s: string, r: string) {
  return (+w || 0) * (+s || 0) * (+r || 0);
}

function rpeColor(rpe: string) {
  const v = +rpe;
  if (!v) return "text-gray-400";
  if (v >= 9) return "text-red-600 font-bold";
  if (v >= 8) return "text-orange-500 font-bold";
  if (v >= 7) return "text-yellow-600 font-semibold";
  return "text-green-600";
}

function intensityBar(rpe: string, rir: string) {
  const effectiveRpe = rpe ? +rpe : rir ? 10 - +rir : 0;
  if (!effectiveRpe) return null;
  const pct = Math.min(100, ((effectiveRpe - 5) / 5) * 100);
  const color =
    effectiveRpe >= 9
      ? "bg-red-500"
      : effectiveRpe >= 8
        ? "bg-orange-400"
        : effectiveRpe >= 7
          ? "bg-yellow-400"
          : "bg-green-400";
  return (
    <div className="flex items-center gap-1">
      <div className="w-10 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const EMPTY_ROW = (dayTitle = ""): LogRow => ({
  dayTitle,
  exerciseName: "",
  weight: "",
  sets: "3",
  reps: "10",
  rir: "2",
  rpe: "8",
  notes: "",
  saved: false,
  fromProgram: false,
});

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function SessionLogPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedDay, setSelectedDay] = useState<ProgramDay | null>(null);
  const [saving, setSaving] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [showProgramPicker, setShowProgramPicker] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load session + existing logs ──
  const load = useCallback(async () => {
    const s: Session = await sessionsApi.get(id);
    setSession(s);

    // Load saved logs if any
    const savedLogs: WorkoutLog[] = await workoutLogsApi
      .getForSession(id)
      .catch(() => []);
    if (savedLogs.length > 0) {
      setRows(
        savedLogs.map((l) => ({
          id: l.id,
          dayTitle: l.dayTitle || "",
          exerciseName: l.exerciseName,
          weight: String(l.weight),
          sets: String(l.sets),
          reps: String(l.reps),
          rir: String(l.rir ?? ""),
          rpe: String(l.rpe ?? ""),
          notes: l.notes || "",
          saved: true,
          fromProgram: false,
        })),
      );
    }

    // Load member's programs for picker
    if (s.memberId) {
      const progs: Program[] = await programsApi
        .listByMember(s.memberId)
        .catch(() => []);
      setPrograms(progs);

      // Auto-select if session already has a program attached
      if (s.programId) {
        const attached = progs.find((p) => p.id === s.programId);
        if (attached) {
          setSelectedProgram(attached);
          if (attached.days?.length > 0) setSelectedDay(attached.days[0]);
        }
      }

      // If no saved logs, try auto-prefill from program
      if (savedLogs.length === 0 && s.programId) {
        const prefilled = await workoutLogsApi.getPrefilled(id).catch(() => []);
        if (prefilled.length > 0) {
          setRows(
            prefilled.map((p: any) => ({
              dayTitle: p.dayTitle || "",
              exerciseName: p.exerciseName,
              weight: String(p.weight || ""),
              sets: String(p.sets || 3),
              reps: String(p.reps || 10),
              rir: String(p.rir ?? 2),
              rpe: String(p.rpe ?? 8),
              notes: p.notes || "",
              saved: false,
              fromProgram: true,
            })),
          );
        }
      }
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [id]);

  // ── Timer — stop when session ended ──
  useEffect(() => {
    if (!session?.startedAt) return;

    // If already ended, freeze at actual duration and don't start timer
    if (session?.endedAt) {
      setElapsed(
        dayjs(session.endedAt).diff(dayjs(session.startedAt), "second"),
      );
      return;
    }

    // Still running — tick every second
    timerRef.current = setInterval(() => {
      setElapsed(dayjs().diff(dayjs(session.startedAt), "second"));
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session?.startedAt, session?.endedAt]);

  // ── Load exercises from selected program day ──
  const loadFromProgramDay = (day: ProgramDay) => {
    if (!day.exercises?.length) return toast.error("วันนี้ไม่มีท่าออกกำลังกาย");
    const newRows: LogRow[] = day.exercises
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((ex) => ({
        dayTitle: day.title,
        exerciseName: ex.exerciseName,
        weight: String(ex.defaultWeight || ""),
        sets: String(ex.defaultSets || 3),
        reps: String(ex.defaultReps || 10),
        rir: String(ex.defaultRir ?? 2),
        rpe: String(ex.defaultRpe ?? 8),
        notes: ex.notes || "",
        saved: false,
        fromProgram: true,
      }));
    setRows((prev) => {
      // Replace rows that match this dayTitle, or append if new
      const otherRows = prev.filter((r) => r.dayTitle !== day.title || r.saved);
      return [...otherRows, ...newRows];
    });
    setShowProgramPicker(false);
    toast.success(`โหลด ${newRows.length} ท่าจาก "${day.title}" แล้ว`);
  };

  // ── Row operations ──
  const addRow = (dayTitle = "") =>
    setRows((prev) => [...prev, EMPTY_ROW(dayTitle)]);

  const updateRow = (i: number, k: keyof LogRow, v: string) =>
    setRows((prev) =>
      prev.map((r, ri) => (ri === i ? { ...r, [k]: v, saved: false } : r)),
    );

  const removeRow = async (i: number) => {
    const row = rows[i];
    if (row.id) {
      if (!confirm("ลบบันทึกนี้?")) return;
      await workoutLogsApi.remove(row.id);
      toast.success("ลบแล้ว");
    }
    setRows((prev) => prev.filter((_, ri) => ri !== i));
  };

  const moveRow = (i: number, dir: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const target = i + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[i], next[target]] = [next[target], next[i]];
      return next;
    });
  };

  // ── Save ──
  const saveAll = async () => {
    const invalid = rows.find(
      (r) => !r.exerciseName.trim() || !r.weight || !r.sets || !r.reps,
    );
    if (invalid)
      return toast.error(`กรอกข้อมูลให้ครบ: ชื่อท่า, น้ำหนัก, เซ็ต, ครั้ง`);
    setSaving(true);
    try {
      await workoutLogsApi.saveBulk(
        id,
        rows.map((r, i) => ({
          dayTitle: r.dayTitle,
          exerciseName: r.exerciseName,
          weight: +r.weight,
          sets: +r.sets,
          reps: +r.reps,
          rir: r.rir ? +r.rir : undefined,
          rpe: r.rpe ? +r.rpe : undefined,
          notes: r.notes,
          sortOrder: i,
        })),
      );
      setRows((prev) => prev.map((r) => ({ ...r, saved: true })));
      toast.success("💾 บันทึก Workout Log แล้ว!");
      load();
    } catch {
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setSaving(false);
    }
  };

  const endSession = async () => {
    if (rows.some((r) => !r.saved)) {
      if (!confirm("ยังมีข้อมูลที่ยังไม่ได้บันทึก ต้องการจบ Session หรือไม่?"))
        return;
    }
    // Stop timer immediately
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    await saveAll();
    const ended = await sessionsApi.end(id);
    // Freeze elapsed at actual duration
    if (session?.startedAt) {
      setElapsed(dayjs().diff(dayjs(session.startedAt), "second"));
    }
    setSession((prev) =>
      prev
        ? { ...prev, status: "completed", endedAt: new Date().toISOString() }
        : prev,
    );
    toast.success("✅ จบ Session แล้ว");
    setTimeout(() => router.push("/admin/sessions"), 1500);
  };

  const fmt = (s: number) =>
    `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Stats ──
  const totalVolume = rows.reduce(
    (sum, r) => sum + calcVol(r.weight, r.sets, r.reps),
    0,
  );
  const totalSets = rows.reduce((s, r) => s + (+r.sets || 0), 0);
  const avgRpe = rows.filter((r) => r.rpe).length
    ? rows.filter((r) => r.rpe).reduce((s, r) => s + +r.rpe, 0) /
      rows.filter((r) => r.rpe).length
    : 0;

  // Group rows by dayTitle for display
  // ลบบรรทัดที่มี Error ทิ้ง และแทนที่ด้วยบรรทัดนี้ครับ
  const groupedDays = Array.from(new Set(rows.map((r) => r.dayTitle)));

  if (!session)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );

  return (
    <div className="animate-fade-in space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/sessions" className="btn-ghost btn-sm">
            ← กลับ
          </Link>
          <div>
            <h1 className="page-title">Workout Log</h1>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <span>👤 {session.member?.name}</span>
              <span>•</span>
              <span>
                📅 {dayjs(session.scheduledAt).format("ddd DD/MM/YYYY HH:mm")}
              </span>
              <span>•</span>
              {session.status === "completed" ? (
                <span className="badge-green">เสร็จแล้ว</span>
              ) : session.status === "in_progress" ? (
                <span className="badge-blue">🏋️ กำลังเทรน</span>
              ) : (
                <span className="badge-amber">รอเริ่ม</span>
              )}
            </div>
          </div>
        </div>

        {/* Timer + actions */}
        <div className="flex items-center gap-4">
          {session.startedAt && (
            <div className="text-center bg-gray-900 text-white px-4 py-2 rounded-xl">
              <div className="font-mono text-xl font-bold">{fmt(elapsed)}</div>
              <div className="text-xs text-gray-400">เวลาที่ใช้</div>
            </div>
          )}
          <button onClick={saveAll} disabled={saving} className="btn-primary">
            {saving ? "⏳ กำลังบันทึก..." : "💾 บันทึก"}
          </button>
          {session.status === "in_progress" && (
            <button onClick={endSession} className="btn-success">
              ✅ จบ Session
            </button>
          )}
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "ท่าทั้งหมด",
            value: rows.length,
            unit: "ท่า",
            color: "text-gray-900",
          },
          {
            label: "Total Sets",
            value: totalSets,
            unit: "set",
            color: "text-blue-700",
          },
          {
            label: "Total Volume",
            value: totalVolume.toLocaleString(),
            unit: "kg",
            color: "text-purple-700",
          },
          {
            label: "RPE เฉลี่ย",
            value: avgRpe ? avgRpe.toFixed(1) : "-",
            unit: "/ 10",
            color: avgRpe >= 8.5 ? "text-red-600" : "text-orange-500",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-400">{s.unit}</div>
          </div>
        ))}
      </div>

      {/* ── Program Picker ── */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-gray-700">
              📋 โหลดจากโปรแกรม
            </span>
            {selectedDay && (
              <span className="badge-blue">
                {selectedProgram?.name} › {selectedDay.title}
              </span>
            )}
          </div>
          <button
            onClick={() => setShowProgramPicker((v) => !v)}
            className="btn-secondary btn-sm"
          >
            {showProgramPicker ? "× ปิด" : "🔍 เลือกโปรแกรม / วัน"}
          </button>
        </div>

        {showProgramPicker && (
          <div className="mt-4 animate-fade-in">
            {programs.length === 0 ? (
              <div className="text-center py-6 text-gray-400 text-sm">
                สมาชิกคนนี้ยังไม่มีโปรแกรม{" "}
                <Link
                  href="/admin/programs"
                  className="text-blue-500 underline"
                >
                  สร้างโปรแกรม
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {programs.map((prog) => (
                  <div
                    key={prog.id}
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    {/* Program header */}
                    <div
                      className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                        selectedProgram?.id === prog.id
                          ? "bg-blue-50"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() =>
                        setSelectedProgram(
                          selectedProgram?.id === prog.id ? null : prog,
                        )
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-gray-800">
                          {prog.name}
                        </span>
                        {prog.isActive && (
                          <span className="badge-green text-xs">Active</span>
                        )}
                        <span className="text-xs text-gray-400">
                          {prog.days?.length || 0} วัน
                        </span>
                      </div>
                      <span className="text-gray-400 text-xs">
                        {selectedProgram?.id === prog.id ? "▲" : "▼"}
                      </span>
                    </div>

                    {/* Days */}
                    {selectedProgram?.id === prog.id && (
                      <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-white">
                        {prog.days
                          ?.sort((a, b) => a.dayOrder - b.dayOrder)
                          .map((day) => (
                            <button
                              key={day.id}
                              onClick={() => {
                                setSelectedDay(day);
                                loadFromProgramDay(day);
                              }}
                              className={`flex flex-col text-left px-4 py-3 rounded-xl border-2 transition-all hover:shadow-sm ${
                                selectedDay?.id === day.id
                                  ? "border-blue-400 bg-blue-50 text-blue-700"
                                  : "border-gray-200 hover:border-blue-200"
                              }`}
                            >
                              <span className="font-semibold text-sm">
                                {day.title}
                              </span>
                              <span className="text-xs text-gray-400 mt-0.5">
                                {day.exercises?.length || 0} ท่า
                                {day.exercises?.length > 0 && (
                                  <>
                                    {" "}
                                    •{" "}
                                    {day.exercises
                                      .slice(0, 2)
                                      .map((e) => e.exerciseName)
                                      .join(", ")}
                                    {day.exercises.length > 2 && "..."}
                                  </>
                                )}
                              </span>
                              <span className="text-xs text-blue-500 mt-1 font-medium">
                                คลิกเพื่อโหลด →
                              </span>
                            </button>
                          ))}
                        {(!prog.days || prog.days.length === 0) && (
                          <div className="col-span-3 text-center py-4 text-gray-400 text-sm">
                            โปรแกรมนี้ยังไม่มีวันเทรน
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Workout Table ── */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="font-semibold text-gray-800">
            รายการท่าออกกำลังกาย
            {rows.some((r) => r.fromProgram && !r.saved) && (
              <span className="ml-2 badge-purple text-xs">โหลดจากโปรแกรม</span>
            )}
          </h3>
          <button
            onClick={() => addRow(groupedDays[0] || "")}
            className="btn-secondary btn-sm"
          >
            + เพิ่มท่า
          </button>
        </div>

        {rows.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-4 text-gray-400">
            <div className="text-5xl">🏋️</div>
            <div className="text-center">
              <div className="font-medium">ยังไม่มีท่าออกกำลังกาย</div>
              <div className="text-sm mt-1">
                เลือก <strong>โหลดจากโปรแกรม</strong> หรือเพิ่มเองด้านบน
              </div>
            </div>
            <button
              onClick={() => setShowProgramPicker(true)}
              className="btn-primary btn-sm"
            >
              📋 โหลดจากโปรแกรม
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-6">
                    #
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase w-28">
                    กลุ่มกล้าม
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    ท่าออกกำลังกาย
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-24">
                    น้ำหนัก (kg)
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-16">
                    Set
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-16">
                    Reps
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-20">
                    Volume
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-16">
                    RIR
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-16">
                    RPE
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-400 uppercase w-24">
                    ความเข้มข้น
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-400 uppercase">
                    หมายเหตุ
                  </th>
                  <th className="px-3 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const vol = calcVol(row.weight, row.sets, row.reps);
                  // Day divider
                  const showDivider =
                    i === 0 || row.dayTitle !== rows[i - 1].dayTitle;
                  return (
                    <>
                      {showDivider && row.dayTitle && (
                        <tr
                          key={`div-${i}`}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50"
                        >
                          <td colSpan={12} className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-700 text-sm">
                                {row.dayTitle}
                              </span>
                              <div className="flex-1 h-px bg-blue-200" />
                              <button
                                onClick={() => addRow(row.dayTitle)}
                                className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                              >
                                + เพิ่มท่าใน {row.dayTitle}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                      <tr
                        key={i}
                        className={`border-b border-gray-50 transition-colors ${
                          row.saved
                            ? "bg-emerald-50/30"
                            : row.fromProgram
                              ? "bg-blue-50/20"
                              : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <td className="px-3 py-2.5 text-gray-300 text-xs">
                          {i + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-xs py-1.5"
                            placeholder="Upper Body"
                            value={row.dayTitle}
                            onChange={(e) =>
                              updateRow(i, "dayTitle", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-sm font-medium py-1.5"
                            placeholder="Barbell Squat"
                            value={row.exerciseName}
                            onChange={(e) =>
                              updateRow(i, "exerciseName", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-sm text-center py-1.5"
                            type="number"
                            step="2.5"
                            min="0"
                            value={row.weight}
                            onChange={(e) =>
                              updateRow(i, "weight", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-sm text-center font-bold text-blue-700 py-1.5"
                            type="number"
                            min="1"
                            value={row.sets}
                            onChange={(e) =>
                              updateRow(i, "sets", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-sm text-center font-bold text-indigo-700 py-1.5"
                            type="number"
                            min="1"
                            value={row.reps}
                            onChange={(e) =>
                              updateRow(i, "reps", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {vol > 0 ? (
                            <span className="font-mono font-bold text-purple-700 text-xs">
                              {vol.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-sm text-center py-1.5"
                            type="number"
                            min="0"
                            max="5"
                            value={row.rir}
                            onChange={(e) =>
                              updateRow(i, "rir", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className={`input text-sm text-center py-1.5 ${rpeColor(row.rpe)}`}
                            type="number"
                            min="1"
                            max="10"
                            step="0.5"
                            value={row.rpe}
                            onChange={(e) =>
                              updateRow(i, "rpe", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {intensityBar(row.rpe, row.rir)}
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            className="input text-xs py-1.5"
                            placeholder="หมายเหตุ"
                            value={row.notes}
                            onChange={(e) =>
                              updateRow(i, "notes", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveRow(i, -1)}
                              disabled={i === 0}
                              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveRow(i, 1)}
                              disabled={i === rows.length - 1}
                              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-600 disabled:opacity-20 text-xs"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removeRow(i)}
                              className="w-6 h-6 flex items-center justify-center text-red-300 hover:text-red-600 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-gray-50 border-t-2 border-gray-200">
                    <td
                      colSpan={4}
                      className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                    >
                      รวมทั้งหมด
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-blue-700">
                      {totalSets}
                    </td>
                    <td />
                    <td className="px-3 py-3 text-center font-mono font-bold text-purple-700">
                      {totalVolume.toLocaleString()}
                    </td>
                    <td colSpan={2} />
                    <td className="px-3 py-3 text-center">
                      {avgRpe > 0 && (
                        <span
                          className={`text-xs font-bold ${rpeColor(String(avgRpe))}`}
                        >
                          avg {avgRpe.toFixed(1)}
                        </span>
                      )}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>

      {/* ── Quick add row buttons ── */}
      {rows.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-gray-400 self-center">เพิ่มท่าใน:</span>
          {groupedDays.map((day) => (
            <button
              key={day}
              onClick={() => addRow(day === "—" ? "" : day)}
              className="btn-ghost btn-sm text-xs border border-gray-200"
            >
              + {day}
            </button>
          ))}
          <button
            onClick={() => addRow()}
            className="btn-ghost btn-sm text-xs border border-dashed border-gray-300"
          >
            + กลุ่มใหม่
          </button>
        </div>
      )}
    </div>
  );
}
