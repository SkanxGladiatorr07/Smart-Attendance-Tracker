import { useState } from 'react';
import { UserCheck, Calendar as CalendarIcon, RefreshCw, Clock } from 'lucide-react';
import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';
import InteractiveAttendanceCalendar from '../components/calendar/InteractiveAttendanceCalendar';
import { useAttendance } from '../context/AttendanceContext';
import Button from '../components/common/Button';

export default function Attendance() {
  const { todaySchedule, loading, refreshAll } = useAttendance();
  const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'today'

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
            <span>Attendance & Calendar</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1 flex items-center gap-2">
            <CalendarIcon size={14} className="text-indigo-400 shrink-0" />
            <span className="font-medium text-gray-300">{formattedDate}</span>
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* View Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CalendarIcon size={14} />
              <span>Monthly Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-2 transition-all ${
                activeTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Clock size={14} />
              <span>Today&apos;s Schedule</span>
            </button>
          </div>

          <Button
            variant="secondary"
            size="md"
            onClick={refreshAll}
            isLoading={loading}
            leftIcon={<RefreshCw size={16} />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Content Views */}
      {activeTab === 'calendar' ? (
        <InteractiveAttendanceCalendar />
      ) : (
        <TodayScheduleWidget interactiveAttendance={true} />
      )}
    </div>
  );
}
