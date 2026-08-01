import { CloudOff } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export default function PendingSyncBadge() {
  const { pendingOfflineCount } = useAttendance();

  if (!pendingOfflineCount || pendingOfflineCount <= 0) return null;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold animate-pulse">
      <CloudOff size={14} className="text-amber-400 shrink-0" />
      <span>{pendingOfflineCount} offline change{pendingOfflineCount > 1 ? 's' : ''} queued</span>
    </div>
  );
}
