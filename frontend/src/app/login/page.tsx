'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState('admin@fitlog.com');
  const [password, setPassword] = useState('admin1234');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { accessToken, user } = await authApi.login(email, password);
      setAuth(user, accessToken);
      toast.success(`ยินดีต้อนรับ!`);
      router.push(user.role === 'admin' ? '/admin' : '/member');
    } catch {
      toast.error('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="font-display text-4xl text-white mb-1">
            Fit<span className="text-blue-400">Log</span> Pro
          </div>
          <p className="text-blue-300/60 text-sm">Fitness Trainer Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">เข้าสู่ระบบ</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">อีเมล</label>
              <input
                className="input"
                type="email"
                required
                autoFocus
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@fitlog.com"
              />
            </div>
            <div>
              <label className="label">รหัสผ่าน</label>
              <input
                className="input"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> กำลังเข้าสู่ระบบ...</span>
              ) : 'เข้าสู่ระบบ'}
            </button>
          </form>
          <div className="mt-5 pt-5 border-t border-gray-100 text-xs text-gray-400 text-center">
            Admin: admin@fitlog.com / admin1234
          </div>
        </div>
      </div>
    </div>
  );
}
