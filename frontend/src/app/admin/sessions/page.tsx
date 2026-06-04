'use client';
import { useEffect, useState } from 'react';
import { sessionsApi, membersApi } from '@/lib/api';
import { Session, Member } from '@/types';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'badge-amber',
  in_progress: 'badge-blue',
  completed: 'badge-green',
  cancelled: 'badge-red',
};
const STATUS_LABELS: Record<string, string> = {
  scheduled: 'รอเทรน',
  in_progress: 'กำลังเทรน',
  completed: 'เสร็จแล้ว',
  cancelled: 'ยกเลิก',
};

export default function SessionsListPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [filterMember, setFilterMember] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [showSchedule, setShowSchedule] = useState(false);
  const [schedForm, setSchedForm] = useState({ memberId: '', scheduledAt: '', notes: '' });

  const load = async () => {
    setLoading(true);
    const [sess, mems] = await Promise.all([
      sessionsApi.list({ memberId: filterMember || undefined, date: filterDate || undefined }),
      membersApi.list(),
    ]);
    setSessions(sess);
    setMembers(mems);
    setLoading(false);
  };

  useEffect(() => { load(); }, [filterMember, filterDate]);

  const handleStart = async (id: string) => {
    try {
      await sessionsApi.start(id);
      toast.success('เริ่มเทรนแล้ว! ลดจำนวนครั้ง 1 ครั้ง');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('ยกเลิก session นี้?')) return;
    try {
      await sessionsApi.cancel(id);
      toast.success('ยกเลิกแล้ว');
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  const schedule = async () => {
    if (!schedForm.memberId || !schedForm.scheduledAt) return toast.error('กรอกข้อมูลให้ครบ');
    try {
      await sessionsApi.schedule(schedForm);
      toast.success('นัดหมายสำเร็จ');
      setShowSchedule(false);
      setSchedForm({ memberId: '', scheduledAt: '', notes: '' });
      load();
    } catch (e: any) { toast.error(e.response?.data?.message || 'เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Session ทั้งหมด</h1>
        <button onClick={() => setShowSchedule(true)} className="btn-primary">+ นัดหมายใหม่</button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">สมาชิก</label>
          <select className="input w-48" value={filterMember} onChange={e => setFilterMember(e.target.value)}>
            <option value="">ทั้งหมด</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">วันที่</label>
          <input type="date" className="input w-40" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        </div>
        {(filterMember || filterDate) && (
          <button className="btn-ghost btn-sm" onClick={() => { setFilterMember(''); setFilterDate(''); }}>
            ล้างตัวกรอง ×
          </button>
        )}
      </div>

      <div className="card">
        {loading ? (
          <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>สมาชิก</th>
                <th>วันที่นัด</th>
                <th>เวลาเริ่ม</th>
                <th>เวลาจบ</th>
                <th>สถานะ</th>
                <th>การดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="font-medium text-gray-900">{s.member?.name || '-'}</div>
                  </td>
                  <td>{dayjs(s.scheduledAt).format('DD/MM/YYYY HH:mm')}</td>
                  <td>{s.startedAt ? dayjs(s.startedAt).format('HH:mm') : '-'}</td>
                  <td>{s.endedAt ? dayjs(s.endedAt).format('HH:mm') : '-'}</td>
                  <td>
                    <span className={STATUS_COLORS[s.status] || 'badge-gray'}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {s.status === 'scheduled' && (
                        <button onClick={() => handleStart(s.id)} className="btn btn-sm btn-success">
                          🏋️ เริ่มเทรน
                        </button>
                      )}
                      {(s.status === 'in_progress' || s.status === 'scheduled') && (
                        <Link href={`/admin/sessions/${s.id}`} className="btn btn-sm btn-primary">
                          Workout Log
                        </Link>
                      )}
                      {s.status === 'completed' && (
                        <Link href={`/admin/sessions/${s.id}`} className="btn btn-sm btn-ghost">
                          ดูบันทึก
                        </Link>
                      )}
                      {(s.status === 'scheduled' || s.status === 'in_progress') && (
                        <button onClick={() => handleCancel(s.id)} className="btn btn-sm btn-danger">
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {sessions.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">ไม่พบ Session</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

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
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.totalSessions - m.usedSessions} ครั้งคงเหลือ)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">วันที่และเวลา</label>
                <input className="input" type="datetime-local" value={schedForm.scheduledAt}
                  onChange={e => setSchedForm(f => ({ ...f, scheduledAt: e.target.value }))} />
              </div>
              <div>
                <label className="label">หมายเหตุ</label>
                <input className="input" placeholder="optional" value={schedForm.notes}
                  onChange={e => setSchedForm(f => ({ ...f, notes: e.target.value }))} />
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
