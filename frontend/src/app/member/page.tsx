'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi, nutritionApi, sessionsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Member, MemberStats, NutritionPlan, Session } from '@/types';
import { CalorieChart } from '@/components/charts/CalorieChart';
import { MacroPieChart } from '@/components/charts/MacroPieChart';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import toast from 'react-hot-toast';

export default function MemberPortal() {
  const router = useRouter();
  const { user, logout, hydrate } = useAuthStore();
  const [member, setMember] = useState<Member | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (!user) {
      const token = localStorage.getItem('access_token');
      if (!token) { router.replace('/login'); return; }
    } else if (user.role !== 'member' || !user.memberId) {
      router.replace('/admin');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user?.memberId) return;
    const mid = user.memberId;
    Promise.all([
      membersApi.get(mid),
      membersApi.stats(mid),
      nutritionApi.getActivePlan(mid).catch(() => null),
      sessionsApi.list({ memberId: mid }),
      nutritionApi.getChart(mid, 30).catch(() => null),
    ]).then(([m, s, p, sess, chart]) => {
      setMember(m); setStats(s); setPlan(p); setSessions(sess); setChartData(chart);
    }).finally(() => setLoading(false));
  }, [user?.memberId]);

  const handleLogout = () => { logout(); router.push('/login'); };

  if (loading || !member) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  const progressPct = stats ? Math.round((stats.usedSessions / stats.totalSessions) * 100) : 0;
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled' || s.status === 'in_progress')
    .sort((a, b) => dayjs(a.scheduledAt).diff(dayjs(b.scheduledAt)));
  const pastSessions = sessions.filter(s => s.status === 'completed')
    .sort((a, b) => dayjs(b.scheduledAt).diff(dayjs(a.scheduledAt)));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="font-display text-xl">
          Fit<span className="text-blue-400">Log</span> <span className="text-gray-500 text-sm font-sans">Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">{member.name}</span>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-red-400 transition-colors">ออก</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6 space-y-6">

        {/* Welcome + Package */}
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {member.name[0]}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
                <p className="text-sm text-gray-500 mt-0.5">{member.goal || 'ไม่ระบุเป้าหมาย'}</p>
              </div>
            </div>
            <div className="text-right">
              {stats?.isExpired ? (
                <span className="badge-red">หมดอายุแล้ว</span>
              ) : (
                <span className="badge-green">Active — เหลือ {stats?.daysLeft} วัน</span>
              )}
            </div>
          </div>

          {/* Session progress */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">จำนวนครั้งที่ใช้</span>
              <span className="font-bold">{stats?.usedSessions} / {stats?.totalSessions} ครั้ง</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>เหลือ {stats?.remainingSessions} ครั้ง</span>
              <span>หมดอายุ {dayjs(member.expiresAt).format('DD/MM/YYYY')}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'น้ำหนัก', value: member.weight, unit: 'kg', color: 'blue' },
            { label: 'ส่วนสูง', value: member.height, unit: 'cm', color: 'indigo' },
            { label: 'BMI', value: (member.weight / ((member.height / 100) ** 2)).toFixed(1), unit: '', color: 'purple' },
            { label: 'เทรนแล้ว', value: pastSessions.length, unit: 'ครั้ง', color: 'emerald' },
          ].map(s => (
            <div key={s.label} className="card p-4 text-center">
              <div className="text-xs text-gray-400 mb-1">{s.label}</div>
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400">{s.unit}</div>
            </div>
          ))}
        </div>

        {/* Upcoming sessions */}
        {upcomingSessions.length > 0 && (
          <div className="card">
            <div className="card-header">
              <h2 className="font-semibold text-gray-800">📅 การนัดหมายที่กำลังจะมาถึง</h2>
            </div>
            <div className="divide-y divide-gray-50">
              {upcomingSessions.map(s => (
                <div key={s.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{dayjs(s.scheduledAt).locale('th').format('ddd, D MMM YYYY')}</div>
                    <div className="text-sm text-gray-500">{dayjs(s.scheduledAt).format('HH:mm')} น.</div>
                  </div>
                  {s.status === 'in_progress' ? (
                    <span className="badge-blue">🏋️ กำลังเทรนอยู่!</span>
                  ) : (
                    <span className="badge-amber">รอเทรน</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Plan */}
        {plan && (
          <div className="grid md:grid-cols-2 gap-5">
            <div className="card">
              <div className="card-header">
                <h2 className="font-semibold text-gray-800">🥗 แผนโภชนาการ</h2>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: 'BMR', value: Math.round(+plan.bmr), unit: 'kcal', color: 'bg-blue-100 text-blue-700' },
                  { label: 'TDEE', value: Math.round(+plan.tdee), unit: 'kcal', color: 'bg-indigo-100 text-indigo-700' },
                  { label: 'เป้าหมายแคลอรี่', value: Math.round(+plan.targetCalories), unit: 'kcal/วัน', color: 'bg-emerald-100 text-emerald-700' },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}>
                      {item.value.toLocaleString()} {item.unit}
                    </span>
                  </div>
                ))}
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  {[
                    { label: '🥩 โปรตีน', value: Math.round(+plan.proteinG), color: 'bg-blue-500' },
                    { label: '🌾 คาร์บ', value: Math.round(+plan.carbG), color: 'bg-emerald-500' },
                    { label: '🫙 ไขมัน', value: Math.round(+plan.fatG), color: 'bg-amber-500' },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{m.label}</span><span className="font-semibold">{m.value}g</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: `${Math.min(100, (m.value / 300) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header"><h2 className="font-semibold text-gray-800">สัดส่วนแมคโคร</h2></div>
              <div className="p-5"><MacroPieChart plan={plan} /></div>
            </div>
          </div>
        )}

        {/* Calorie chart */}
        {chartData?.logs?.length > 0 && (
          <div className="card">
            <div className="card-header"><h2 className="font-semibold text-gray-800">📊 แคลอรี่ 30 วันที่ผ่านมา</h2></div>
            <div className="p-5">
              <CalorieChart data={chartData.logs} target={chartData.target} />
            </div>
          </div>
        )}

        {/* Session history */}
        <div className="card">
          <div className="card-header">
            <h2 className="font-semibold text-gray-800">🏋️ ประวัติการเทรน</h2>
            <span className="badge-blue">{pastSessions.length} ครั้ง</span>
          </div>
          {pastSessions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">ยังไม่มีประวัติการเทรน</div>
          ) : (
            <table className="table-base">
              <thead>
                <tr><th>วันที่</th><th>เวลาเริ่ม</th><th>เวลาจบ</th><th>สถานะ</th></tr>
              </thead>
              <tbody>
                {pastSessions.slice(0, 10).map(s => (
                  <tr key={s.id}>
                    <td className="font-medium">{dayjs(s.scheduledAt).locale('th').format('D MMM YYYY')}</td>
                    <td>{s.startedAt ? dayjs(s.startedAt).format('HH:mm') : '-'}</td>
                    <td>{s.endedAt ? dayjs(s.endedAt).format('HH:mm') : '-'}</td>
                    <td><span className="badge-green">เสร็จแล้ว ✓</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Precaution notes */}
        {member.notes && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-sm font-semibold text-amber-800 mb-1">⚠️ ข้อควรระวังสุขภาพ</div>
            <div className="text-sm text-amber-700">{member.notes}</div>
          </div>
        )}
      </div>
    </div>
  );
}
