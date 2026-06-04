'use client';
import { useEffect, useState, useCallback } from 'react';
import { sessionsApi, membersApi } from '@/lib/api';
import { Session, Member, CalendarData } from '@/types';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function CalendarPage() {
  const [year, setYear] = useState(dayjs().year());
  const [month, setMonth] = useState(dayjs().month() + 1);
  const [calData, setCalData] = useState<CalendarData>({});
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedForm, setSchedForm] = useState({ memberId: '', scheduledAt: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    const [cal, mems] = await Promise.all([
      sessionsApi.calendar(year, month),
      membersApi.list(),
    ]);
    setCalData(cal);
    setMembers(mems);
    setLoading(false);
  }, [year, month]);

  useEffect(() => { load(); }, [load]);

  const prevMonth = () => { if (month === 1) { setYear(y => y - 1); setMonth(12); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setYear(y => y + 1); setMonth(1); } else setMonth(m => m + 1); };

  const schedule = async () => {
    if (!schedForm.memberId || !schedForm.scheduledAt) return toast.error('กรุณากรอกข้อมูลให้ครบ');
    try {
      await sessionsApi.schedule(schedForm);
      toast.success('นัดหมายสำเร็จ');
      setShowSchedule(false);
      setSchedForm({ memberId: '', scheduledAt: '', notes: '' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  // Build calendar grid
  const firstDay = dayjs(`${year}-${month}-01`);
  const daysInMonth = firstDay.daysInMonth();
  const startDow = firstDay.day(); // 0=Sun
  const cells: (null | number)[] = [...Array(startDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7 !== 0) cells.push(null);
  const today = dayjs();

  const thaiMonths = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
  const DOW_LABELS = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">ปฏิทินการเทรน</h1>
        <button onClick={() => setShowSchedule(true)} className="btn-primary">+ นัดหมาย</button>
      </div>

      {/* Month nav */}
      <div className="card p-4 flex items-center justify-between">
        <button onClick={prevMonth} className="btn-ghost">← ก่อนหน้า</button>
        <span className="font-display text-xl">
          {thaiMonths[month - 1]} {year + 543}
        </span>
        <button onClick={nextMonth} className="btn-ghost">ถัดไป →</button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> รอเทรน</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> กำลังเทรน</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> เสร็จแล้ว ✓</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" /> ยกเลิก</span>
      </div>

      {/* Calendar grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
      ) : (
        <div className="card overflow-hidden">
          {/* DOW header */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DOW_LABELS.map(d => (
              <div key={d} className={`py-2 text-center text-xs font-semibold ${d === 'อา' ? 'text-red-500' : d === 'ส' ? 'text-blue-500' : 'text-gray-500'}`}>
                {d}
              </div>
            ))}
          </div>
          {/* Weeks */}
          {Array.from({ length: cells.length / 7 }, (_, wi) => (
            <div key={wi} className="grid grid-cols-7 border-b border-gray-50 last:border-0">
              {cells.slice(wi * 7, wi * 7 + 7).map((day, di) => {
                if (day === null) return <div key={di} className="min-h-[100px] bg-gray-50/50 p-2" />;
                const dateKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const daySessions = calData[dateKey] || [];
                const isToday = today.format('YYYY-MM-DD') === dateKey;
                const isSun = (di + startDow) % 7 === 0;
                const isSat = (di + startDow) % 7 === 6;

                return (
                  <div key={di} className={`min-h-[100px] p-2 border-l border-gray-50 transition-colors hover:bg-gray-50/80
                    ${isSun ? 'bg-red-50/30' : ''} ${isSat ? 'bg-blue-50/20' : ''}`}>
                    <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full
                      ${isToday ? 'bg-blue-600 text-white' : isSun ? 'text-red-500' : isSat ? 'text-blue-500' : 'text-gray-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {daySessions.map((s: Session) => (
                        <SessionPill key={s.id} session={s} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Schedule modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h2 className="font-display text-lg mb-4">นัดหมายเทรน</h2>
            <div className="space-y-3">
              <div>
                <label className="label">สมาชิก</label>
                <select className="input" value={schedForm.memberId} onChange={e => setSchedForm(f => ({ ...f, memberId: e.target.value }))}>
                  <option value="">เลือกสมาชิก</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.totalSessions - m.usedSessions} ครั้งคงเหลือ)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">วันที่และเวลา</label>
                <input className="input" type="datetime-local" value={schedForm.scheduledAt} onChange={e => setSchedForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
              <div>
                <label className="label">หมายเหตุ</label>
                <input className="input" placeholder="optional" value={schedForm.notes} onChange={e => setSchedForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={schedule} className="btn-primary flex-1">บันทึกนัดหมาย</button>
              <button onClick={() => setShowSchedule(false)} className="btn-secondary">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SessionPill({ session }: { session: Session }) {
  const colorMap: Record<string, string> = {
    scheduled: 'bg-amber-100 text-amber-800 border-amber-200',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    cancelled: 'bg-red-100 text-red-600 border-red-200 line-through opacity-60',
  };
  const dotMap: Record<string, string> = {
    scheduled: 'bg-amber-400',
    in_progress: 'bg-blue-500',
    completed: 'bg-emerald-500',
    cancelled: 'bg-red-400',
  };
  return (
    <div className={`text-xs px-1.5 py-0.5 rounded border flex items-center gap-1 ${colorMap[session.status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotMap[session.status]}`} />
      <span className="truncate font-medium">{session.member?.name}</span>
      <span className="text-gray-500 flex-shrink-0">{dayjs(session.scheduledAt).format('HH:mm')}</span>
    </div>
  );
}
