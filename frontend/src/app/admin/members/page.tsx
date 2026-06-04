'use client';
import { useEffect, useState } from 'react';
import { membersApi } from '@/lib/api';
import { Member, PACKAGE_LABELS } from '@/types';
import Link from 'next/link';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    membersApi.list().then(setMembers).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const filtered = members.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`ลบสมาชิก "${name}" ใช่หรือไม่?`)) return;
    try {
      await membersApi.remove(id);
      toast.success('ลบสมาชิกแล้ว');
      load();
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">สมาชิกทั้งหมด</h1>
        <Link href="/admin/members/new" className="btn-primary">+ เพิ่มสมาชิก</Link>
      </div>

      <div className="card">
        <div className="card-header">
          <input
            type="text"
            placeholder="ค้นหาชื่อหรืออีเมล..."
            className="input max-w-xs"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="text-sm text-gray-500">{filtered.length} คน</span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">กำลังโหลด...</div>
        ) : (
          <table className="table-base">
            <thead>
              <tr>
                <th>ชื่อ</th>
                <th>แพ็กเกจ</th>
                <th>จำนวนครั้ง</th>
                <th>วันหมดอายุ</th>
                <th>สถานะ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const isExpired = dayjs().isAfter(dayjs(m.expiresAt));
                const daysLeft = dayjs(m.expiresAt).diff(dayjs(), 'day');
                const progress = (m.usedSessions / m.totalSessions) * 100;
                return (
                  <tr key={m.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {m.name[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge-blue">{PACKAGE_LABELS[m.packageType]}</span>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{m.usedSessions}/{m.totalSessions} ครั้ง</div>
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                        <div className="h-1.5 rounded-full bg-blue-500" style={{ width: `${Math.min(100, progress)}%` }} />
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">{dayjs(m.expiresAt).format('DD/MM/YYYY')}</div>
                      {!isExpired && daysLeft <= 7 && (
                        <div className="text-xs text-amber-600">เหลือ {daysLeft} วัน</div>
                      )}
                    </td>
                    <td>
                      {isExpired
                        ? <span className="badge-red">หมดอายุ</span>
                        : <span className="badge-green">Active</span>
                      }
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/members/${m.id}`} className="btn btn-sm btn-secondary">
                          ดูข้อมูล
                        </Link>
                        <button onClick={() => handleDelete(m.id, m.name)}
                          className="btn btn-sm btn-danger">ลบ</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400">ไม่พบสมาชิก</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
