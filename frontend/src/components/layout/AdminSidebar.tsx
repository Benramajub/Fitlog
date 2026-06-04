'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import clsx from 'clsx';

const NAV = [
  { href: '/admin', label: 'ภาพรวม', icon: '📊', exact: true },
  { href: '/admin/members', label: 'สมาชิก', icon: '👥' },
  { href: '/admin/calendar', label: 'ปฏิทิน', icon: '📅' },
  { href: '/admin/sessions', label: 'Session', icon: '🏋️' },
  { href: '/admin/programs', label: 'โปรแกรม', icon: '📋' },
  { href: '/admin/nutrition', label: 'โภชนาการ', icon: '🥗' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <div className="font-display text-xl font-bold">
          Fit<span className="text-blue-400">Log</span> <span className="text-gray-400 text-sm font-sans font-normal">Pro</span>
        </div>
        <div className="text-xs text-gray-500 mt-0.5">Trainer Dashboard</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-content text-xs font-bold flex items-center justify-center">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div>
            <div className="text-xs font-medium text-white">{user?.email}</div>
            <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left text-xs text-gray-500 hover:text-red-400 transition-colors px-1 py-1"
        >
          ออกจากระบบ →
        </button>
      </div>
    </aside>
  );
}
