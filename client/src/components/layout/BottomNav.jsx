import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  UserCheck,
  History,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Setup', path: '/semester-setup', icon: GraduationCap },
  { name: 'Subjects', path: '/subjects', icon: BookOpen },
  { name: 'Attendance', path: '/attendance', icon: UserCheck },
  { name: 'Logs', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-white/10 z-50 px-1 flex items-center justify-around select-none pb-[env(safe-area-inset-bottom)]"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            aria-label={item.name}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-xl transition-all active-press ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-gray-400'} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                  {item.name}
                </span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-0.5 shadow-sm shadow-indigo-400" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
