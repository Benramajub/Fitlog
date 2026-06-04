'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { membersApi } from '@/lib/api';
import { PACKAGE_LABELS, PackageType } from '@/types';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function NewMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: 'member1234',
    age: '', weight: '', height: '',
    gender: 'male',
    joinedAt: dayjs().format('YYYY-MM-DD'),
    packageType: '1_month' as PackageType,
    goal: '', notes: '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await membersApi.create({
        ...form,
        age: +form.age,
        weight: +form.weight,
        height: +form.height,
      });
      toast.success('เพิ่มสมาชิกสำเร็จ!');
      router.push('/admin/members');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/members" className="btn-ghost btn-sm">← กลับ</Link>
        <h1 className="page-title">เพิ่มสมาชิกใหม่</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal info */}
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-gray-700">ข้อมูลส่วนตัว</h2></div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">ชื่อ-นามสกุล *</label>
                <input className="input" required value={form.name} onChange={e => set('name', e.target.value)} placeholder="เนม สมิทธิ์" />
              </div>
              <div>
                <label className="label">อีเมล *</label>
                <input className="input" type="email" required value={form.email} onChange={e => set('email', e.target.value)} placeholder="member@email.com" />
              </div>
              <div>
                <label className="label">รหัสผ่านเริ่มต้น</label>
                <input className="input" value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <label className="label">เพศ</label>
                <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)}>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>
              <div>
                <label className="label">อายุ (ปี) *</label>
                <input className="input" type="number" required min="10" max="100" value={form.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div>
                <label className="label">ส่วนสูง (cm) *</label>
                <input className="input" type="number" required min="100" max="250" value={form.height} onChange={e => set('height', e.target.value)} />
              </div>
              <div>
                <label className="label">น้ำหนัก (kg) *</label>
                <input className="input" type="number" required step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* Package */}
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-gray-700">แพ็กเกจ & การสมัคร</h2></div>
          <div className="card-body space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">วันที่สมัคร *</label>
                <input className="input" type="date" required value={form.joinedAt} onChange={e => set('joinedAt', e.target.value)} />
              </div>
              <div>
                <label className="label">แพ็กเกจ *</label>
                <select className="input" value={form.packageType} onChange={e => set('packageType', e.target.value as PackageType)}>
                  {(Object.entries(PACKAGE_LABELS) as [PackageType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
              <strong>วันหมดอายุ:</strong>{' '}
              {dayjs(form.joinedAt || dayjs()).add(
                form.packageType === '1_month' ? 1 : form.packageType === '2_months' ? 2 : 4,
                'month'
              ).format('DD/MM/YYYY')}
              {' '} | จำนวน: {form.packageType === '1_month' ? 5 : form.packageType === '2_months' ? 10 : 20} ครั้ง
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="card">
          <div className="card-header"><h2 className="font-semibold text-gray-700">เป้าหมาย & หมายเหตุ</h2></div>
          <div className="card-body space-y-4">
            <div>
              <label className="label">เป้าหมายการเทรน</label>
              <input className="input" value={form.goal} onChange={e => set('goal', e.target.value)} placeholder="เช่น ลดไขมัน เพิ่มกล้ามเนื้อ" />
            </div>
            <div>
              <label className="label">ข้อควรระวัง / โรคประจำตัว</label>
              <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="เช่น เจ็บเข่าขวาเล็กน้อย เลี่ยงท่ากระแทก" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'กำลังบันทึก...' : '✓ บันทึกสมาชิก'}
          </button>
          <Link href="/admin/members" className="btn-secondary">ยกเลิก</Link>
        </div>
      </form>
    </div>
  );
}