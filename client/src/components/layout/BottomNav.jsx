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
  { name: 'History', path: '/history', icon: History },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b0f19]/95 backdrop-blur-xl border-t border-white/10 z-50 px-2 flex items-center justify-around select-none">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-400 font-bold scale-105'
                  : 'text-gray-400 hover:text-gray-200'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-indigo-400' : 'text-gray-400'} />
                <span className="text-[10px] mt-1 tracking-tight truncate max-w-[60px]">
                  {item.name}
                </span>
                {isActive && (
                  <span className="w-1 h-1 rounded-full bg-indigo-400 mt-0.5" />
                )}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
