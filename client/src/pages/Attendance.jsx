import { UserCheck, Calendar, RefreshCw } from 'lucide-react';
import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';
import { useAttendance } from '../context/AttendanceContext';
import Button from '../components/common/Button';

export default function Attendance() {
  const { todaySchedule, loading, refreshAll } = useAttendance();

  const formattedDate = todaySchedule?.formattedDate || new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <UserCheck className="text-emerald-400" size={28} />
            <span>{"Today's Attendance"}</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <Calendar size={14} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-gray-300">{formattedDate}</span>
          </p>
        </div>

        <div className="self-start sm:self-auto">
          <Button
            variant="secondary"
            size="md"
            onClick={refreshAll}
            isLoading={loading}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh Schedule
          </Button>
        </div>
      </div>

      {/* Interactive Schedule Widget */}
      <TodayScheduleWidget interactiveAttendance={true} />
    </div>
  );
}
