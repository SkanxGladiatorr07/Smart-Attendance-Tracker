import { NavLink } from 'react-router-dom';
import PwaInstallPrompt from '../PwaInstallPrompt';
import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  History,
  Settings,
  GraduationCap,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Semester Setup', path: '/semester-setup', icon: GraduationCap },
  { name: 'Subjects', path: '/subjects', icon: BookOpen },
  { name: 'Attendance', path: '/attendance', icon: UserCheck },
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-[#0b0f19]/90 backdrop-blur-xl border-r border-white/10 z-40 p-5 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <Cpu size={22} className="text-white" />
        </div>
        <div>
          <span className="font-heading text-xl font-bold text-white tracking-tight block leading-none">
            AttendAI
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
            Smart Tracker
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] uppercase font-bold tracking-wider text-gray-500">
          Main Menu
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all relative ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                  <span>{item.name}</span>
                  {isActive && (
                    <div className="absolute right-2 w-1.5 h-4 bg-white rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & PWA Banner */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <div className="px-1">
          <PwaInstallPrompt />
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <div className="truncate">
            <div className="text-xs font-semibold text-white truncate">System Status</div>
            <div className="text-[11px] text-emerald-400">Online & Synchronized</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
