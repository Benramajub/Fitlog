'use client';
import { useEffect, useState } from 'react';
import { membersApi, sessionsApi } from '@/lib/api';
import { Member, Session } from '@/types';
import Link from 'next/link';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [todaySessions, setTodaySessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = dayjs().format('YYYY-MM-DD');
    Promise.all([
      membersApi.list(),
      sessionsApi.list({ date: today }),
    ]).then(([m, s]) => {
      setMembers(m);
      setTodaySessions(s);
    }).finally(() => setLoading(false));
  }, []);

  const activeMembers = members.filter(m => !dayjs().isAfter(dayjs(m.expiresAt)));
  const expiredMembers = members.filter(m => dayjs().isAfter(dayjs(m.expiresAt)));
  const todayCompleted = todaySessions.filter(s => s.status === 'completed').length;
  const todayScheduled = todaySessions.filter(s => s.status === 'scheduled').length;

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">ภาพรวมระบบ</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {dayjs().locale('th').format('dddd, D MMMM YYYY')}
          </p>
        </div>
        <Link href="/admin/members/new" className="btn-primary">
          + เพิ่มสมาชิกใหม่
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="สมาชิกทั้งหมด" value={members.length} color="blue" icon="👥" />
        <StatCard label="สมาชิกที่ active" value={activeMembers.length} color="green" icon="✅" />
        <StatCard label="เทรนวันนี้แล้ว" value={todayCompleted} color="purple" icon="🏋️" />
        <StatCard label="รอเทรนวันนี้" value={todayScheduled} color="amber" icon="⏳" />
      </div>

      {/* Today's sessions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              📅 นัดหมายวันนี้
            </h2>
            <Link href="/admin/calendar" className="text-xs text-blue-600 hover:underline">
              ดูปฏิทิน →
            </Link>
          </div>
          <div>
            {todaySessions.length === 0 ? (
              <div className="px-5 py-8 text-center text-gray-400 text-sm">
                ไม่มีการนัดหมายวันนี้
              </div>
            ) : (
              <table className="table-base">
                <tbody>
                  {todaySessions.map(s => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.member?.name}</td>
                      <td className="text-gray-500">{dayjs(s.scheduledAt).format('HH:mm')}</td>
                      <td>
                        <StatusBadge status={s.status} />
                      </td>
                      <td>
                        {s.status === 'scheduled' && (
                          <Link href={`/admin/sessions/${s.id}`} className="btn btn-sm btn-primary">
                            เริ่มเทรน
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Member list */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">👥 สมาชิกล่าสุด</h2>
            <Link href="/admin/members" className="text-xs text-blue-600 hover:underline">
              ดูทั้งหมด →
            </Link>
          </div>
          <table className="table-base">
            <tbody>
              {members.slice(0, 6).map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {m.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{m.name}</div>
                        <div className="text-xs text-gray-400">{m.goal || '-'}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="text-sm">{m.usedSessions}/{m.totalSessions} ครั้ง</div>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className="h-1.5 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, (m.usedSessions / m.totalSessions) * 100)}%` }}
                      />
                    </div>
                  </td>
                  <td>
                    {dayjs().isAfter(dayjs(m.expiresAt))
                      ? <span className="badge-red">หมดอายุ</span>
                      : <span className="badge-green">Active</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiry warnings */}
      {expiredMembers.length > 0 && (
        <div className="card border-amber-200 bg-amber-50">
          <div className="card-header">
            <h2 className="font-semibold text-amber-800">⚠️ สมาชิกหมดอายุ ({expiredMembers.length} คน)</h2>
          </div>
          <div className="card-body">
            <div className="flex flex-wrap gap-2">
              {expiredMembers.map(m => (
                <Link key={m.id} href={`/admin/members/${m.id}`}
                  className="badge-amber hover:opacity-80 transition cursor-pointer">
                  {m.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-emerald-500 to-emerald-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
  };
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between mb-3">
        <span className="section-title">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold bg-gradient-to-br ${colors[color]} bg-clip-text text-transparent`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: 'badge-amber',
    in_progress: 'badge-blue',
    completed: 'badge-green',
    cancelled: 'badge-red',
  };
  const labels: Record<string, string> = {
    scheduled: 'รอเทรน',
    in_progress: 'กำลังเทรน',
    completed: 'เสร็จแล้ว',
    cancelled: 'ยกเลิก',
  };
  return <span className={map[status] || 'badge-gray'}>{labels[status] || status}</span>;
}
