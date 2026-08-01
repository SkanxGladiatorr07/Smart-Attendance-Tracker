import { memo } from 'react';
import { Calendar, CheckCircle2, Clock, BookOpen, UserCheck, TrendingUp, ShieldCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { useAttendance } from '../../context/AttendanceContext';

function SemesterProgressWidget() {
  const { semesterProgress, overallStats, loading } = useAttendance();

  if (loading && !semesterProgress) {
    return (
      <Card hover={false} className="p-6 space-y-4">
        <Skeleton height={24} width="40%" />
        <Skeleton height={16} width="60%" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {[1, 2, 3, 4].map(n => <Skeleton key={n} height={80} />)}
        </div>
      </Card>
    );
  }

    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    icon: <ShieldCheck size={16} className="text-emerald-400" />,
  };
  if (overallRate >= 75 && overallRate <= 85) {
    overallTheme = {
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      icon: <AlertTriangle size={16} className="text-amber-400" />,
    };
  } else if (overallRate < 75) {
    overallTheme = {
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      icon: <AlertCircle size={16} className="text-rose-400" />,
    };
  }

  const lecturesPct = data.totalLectures > 0
    ? Math.round((data.totalLecturesCompleted / data.totalLectures) * 100 * 10) / 10
    : 0;

  const daysPct = data.totalWorkingDays > 0
    ? Math.round((data.workingDaysCompleted / data.totalWorkingDays) * 100 * 10) / 10
    : 0;

  return (
    <Card hover={false} className="p-6 space-y-6 border-purple-500/20 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1b4b]/30 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Calendar size={14} className="text-purple-400" />
            <span>Academic Semester Engine</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Semester Progress Dashboard</span>
          </h2>
          <p className="text-xs text-gray-300">
            Integrated with generated academic calendar: <strong className="text-purple-300">{data.semesterName}</strong>
            {data.startDate && data.endDate ? ` (${data.startDate} to ${data.endDate})` : ''}
          </p>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-2">
            <TrendingUp size={16} className="text-purple-400" />
            <span>{data.semesterProgressPct}% Semester Elapsed</span>
          </span>
        </div>
      </div>

      {/* Main Responsive Progress Bar */}
      <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between text-xs font-bold text-gray-300">
          <span className="flex items-center gap-2 text-purple-300">
            <Calendar size={15} />
            <span>Overall Semester Completion</span>
          </span>
          <span className="text-purple-400 font-extrabold text-sm">{data.semesterProgressPct}%</span>
        </div>

        <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden p-0.5 border border-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 shadow-md shadow-purple-500/30"
            style={{ width: `${Math.min(data.semesterProgressPct, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
          <span>Start: <strong>{data.startDate || 'Semester Start'}</strong></span>
          <span>Today: <strong>{data.todayDate}</strong></span>
          <span>End: <strong>{data.endDate || 'Semester End'}</strong></span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Working Days Completed */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-gray-400">Working Days</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Calendar size={15} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-white">
            {data.workingDaysCompleted}{' '}
            <span className="text-xs text-gray-400 font-normal">/ {data.totalWorkingDays} days</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.min(daysPct, 100)}%` }} />
          </div>
          <div className="text-[11px] text-gray-400 font-medium">
            <strong className="text-indigo-400">{data.workingDaysRemaining}</strong> days remaining
          </div>
        </div>

        {/* Working Days Remaining */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-gray-400">Days Remaining</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-amber-400">
            {data.workingDaysRemaining}
          </div>
          <div className="text-[11px] text-gray-400">
            Active working days before semester end
          </div>
        </div>

        {/* Lectures Completed */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-gray-400">Lectures Completed</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <BookOpen size={15} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-white">
            {data.totalLecturesCompleted}{' '}
            <span className="text-xs text-gray-400 font-normal">/ {data.totalLectures} lectures</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.min(lecturesPct, 100)}%` }} />
          </div>
          <div className="text-[11px] text-gray-400 font-medium">
            <strong className="text-amber-400">{data.remainingLectures}</strong> pending lectures
          </div>
        </div>

        {/* Current Overall Attendance */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase font-semibold text-gray-400">Overall Attendance</span>
            <div className={`p-1.5 rounded-lg border ${overallTheme.bgColor} ${overallTheme.borderColor}`}>
              {overallTheme.icon}
            </div>
          </div>
          <div className={`text-2xl font-bold font-heading ${overallTheme.textColor}`}>
            {data.overallAttendancePct}%
          </div>
          <div className="text-[11px] text-gray-400">
            Across all enrolled subjects
          </div>
        </div>
      </div>
    </Card>
  );
}

export default memo(SemesterProgressWidget);
