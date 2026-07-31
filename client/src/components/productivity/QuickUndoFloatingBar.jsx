import { RotateCcw, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';

export default function QuickUndoFloatingBar() {
  const { lastAction, undoLastAction } = useAttendance();

  if (!lastAction) return null;

  const newStatus = lastAction.newStatus;
  const statusLabel = newStatus === 'present' ? 'Present' : newStatus === 'absent' ? 'Absent' : 'Pending';

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-bounceIn">
      <div className="p-3.5 rounded-2xl bg-[#0f172a]/95 border border-indigo-500/40 text-white shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 truncate">
          {newStatus === 'present' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
          {newStatus === 'absent' && <XCircle size={18} className="text-rose-400 shrink-0" />}
          {newStatus === 'pending' && <Clock size={18} className="text-amber-400 shrink-0" />}

          <div className="truncate text-xs">
            <span className="font-bold text-white block truncate">
              Marked {statusLabel}
            </span>
            <span className="text-gray-400 text-[11px] truncate block">
              {lastAction.subjectName}
            </span>
          </div>
        </div>

        {/* 1-Tap Quick Undo Action Button */}
        <button
          type="button"
          onClick={undoLastAction}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <RotateCcw size={14} />
          <span>Undo</span>
        </button>
      </div>
    </div>
  );
}
