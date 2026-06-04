'use client';
import { useEffect, useState } from 'react';
import { membersApi, programsApi } from '@/lib/api';
import { Member, Program } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function ProgramsPage() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => { membersApi.list().then(setMembers); }, []);

  const selectMember = async (m: Member) => {
    setSelectedMember(m);
    setLoading(true);
    const p = await programsApi.listByMember(m.id);
    setPrograms(p);
    setLoading(false);
  };

  const createProgram = async () => {
    if (!form.name.trim() || !selectedMember) return toast.error('กรอกชื่อโปรแกรมด้วย');
    try {
      const p = await programsApi.create({ memberId: selectedMember.id, name: form.name, description: form.description, days: [] });
      toast.success('สร้างโปรแกรมแล้ว');
      setShowCreate(false);
      setForm({ name: '', description: '' });
      router.push(`/admin/programs/${p.id}`);
    } catch { toast.error('เกิดข้อผิดพลาด'); }
  };

  const deleteProgram = async (id: string) => {
    if (!confirm('ลบโปรแกรมนี้?')) return;
    await programsApi.remove(id);
    toast.success('ลบแล้ว');
    if (selectedMember) selectMember(selectedMember);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">โปรแกรมออกกำลังกาย</h1>
          <p className="text-sm text-gray-500 mt-1">สร้างและจัดการ Workout Program รายบุคคล</p>
        </div>
        {selectedMember && (
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            + สร้างโปรแกรมใหม่
          </button>
        )}
      </div>

      <div className="grid grid-cols-[280px_1fr] gap-6">
        {/* Member selector */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">เลือกสมาชิก</div>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => selectMember(m)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                selectedMember?.id === m.id
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-gray-100 text-gray-700 hover:border-gray-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                  selectedMember?.id === m.id ? 'bg-blue-500' : 'bg-gray-400'
                }`}>
                  {m.name[0]}
                </div>
                <div>
                  <div className="font-medium text-sm">{m.name}</div>
                  <div className="text-xs text-gray-400">{m.totalSessions - m.usedSessions} ครั้งคงเหลือ</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Programs list */}
        <div>
          {!selectedMember ? (
            <div className="card flex flex-col items-center justify-center h-64 text-gray-400">
              <div className="text-4xl mb-3">👈</div>
              <div>เลือกสมาชิกเพื่อดูโปรแกรม</div>
            </div>
          ) : loading ? (
            <div className="card flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  โปรแกรมของ <span className="font-semibold text-gray-800">{selectedMember.name}</span>
                  {' '}— {programs.length} โปรแกรม
                </div>
              </div>

              {programs.length === 0 ? (
                <div className="card flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
                  <div className="text-4xl">🏋️</div>
                  <div>ยังไม่มีโปรแกรม</div>
                  <button onClick={() => setShowCreate(true)} className="btn-primary btn-sm">
                    + สร้างโปรแกรมแรก
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {programs.map(p => (
                    <div key={p.id} className="card p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{p.name}</h3>
                            {p.isActive && <span className="badge-green">Active</span>}
                          </div>
                          {p.description && <p className="text-sm text-gray-500 mb-3">{p.description}</p>}
                          <div className="flex flex-wrap gap-2">
                            {p.days?.map(d => (
                              <span key={d.id} className="badge-gray">
                                {d.title} ({d.exercises?.length || 0} ท่า)
                              </span>
                            ))}
                            {(!p.days || p.days.length === 0) && (
                              <span className="text-xs text-gray-400">ยังไม่มีวันเทรน</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link href={`/admin/programs/${p.id}`} className="btn-primary btn-sm">
                            ✏️ แก้ไข
                          </Link>
                          <button onClick={() => deleteProgram(p.id)} className="btn-danger btn-sm">
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <h2 className="font-display text-xl mb-1">สร้างโปรแกรมใหม่</h2>
            <p className="text-sm text-gray-500 mb-5">สำหรับ: {selectedMember?.name}</p>
            <div className="space-y-4">
              <div>
                <label className="label">ชื่อโปรแกรม *</label>
                <input className="input" placeholder="เช่น Upper/Lower Split เดือน มิ.ย." autoFocus
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && createProgram()} />
              </div>
              <div>
                <label className="label">คำอธิบาย (ไม่บังคับ)</label>
                <textarea className="input" rows={2} placeholder="เช่น โปรแกรมสำหรับลดไขมัน + เพิ่มกล้ามเนื้อ"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={createProgram} className="btn-primary flex-1">สร้างโปรแกรม</button>
              <button onClick={() => setShowCreate(false)} className="btn-secondary">ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}