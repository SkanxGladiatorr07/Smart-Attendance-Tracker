/**
 * @file Header.jsx
 * @description Mobile-only sticky top header showing the current page title,
 * PWA install prompt, and pending offline sync badge.
 */

import { useLocation } from 'react-router-dom';
import { Cpu } from 'lucide-react';
import PwaInstallPrompt from './PwaInstallPrompt';
import PendingSyncBadge from '../common/PendingSyncBadge';

const PAGE_TITLES = {
  '/': 'Dashboard Overview',
  '/subjects': 'Subject Management',
  '/attendance': 'Mark Attendance',
  '/history': 'Attendance Logs',
  '/settings': 'Application Settings',
};

export default function Header() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] || 'AttendAI';

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0b0f19]/90 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
          <Cpu size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-heading text-base font-bold text-white tracking-tight leading-none">
            {title}
          </h1>
          <span className="text-[10px] text-gray-400">AttendAI Mobile</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <PendingSyncBadge />
        <PwaInstallPrompt />
      </div>
    </header>
  );
}
