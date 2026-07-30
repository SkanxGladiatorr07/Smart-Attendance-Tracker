import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarOff,
  Palmtree,
  BookOpen,
  GraduationCap,
  Sun,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { useAttendance } from '../../context/AttendanceContext';
import { Card } from '../common/Card';
import Button from '../common/Button';
import Skeleton from '../common/Skeleton';

export default function TodayScheduleWidget({ interactiveAttendance = false }) {
  const {
    todaySchedule,
    loading,
    error,
    updatingLectureId,
    markLectureStatus,
    refreshAll,
  } = useAttendance();

  if (loading && !todaySchedule) {
    return (
      <Card hover={false} className="p-6 space-y-4 border-indigo-500/20 bg-slate-900/40">
        <div className="flex justify-between items-center">
          <Skeleton height={24} width="40%" />
          <Skeleton height={20} width="20%" />
        </div>
        <Skeleton height={80} width="100%" />
        <Skeleton height={80} width="100%" />
      </Card>
    );
  }

  if (error && !todaySchedule) {
    return (
      <Card hover={false} className="p-5 border-rose-500/30 bg-rose-500/10 text-rose-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={refreshAll}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!todaySchedule) return null;

  const {
    formattedDate,
    dayOfWeek,
    isWorkingDay,
    reason,
    lectures = [],
    summary = {}
  } = todaySchedule;

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/20 bg-gradient-to-b from-[#111827] to-[#0f172a] shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
            <Sparkles size={14} />
            <span>Automatic Daily Schedule Engine</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Calendar size={22} className="text-indigo-400" />
            <span>{formattedDate || "Today's Schedule"}</span>
          </h2>
        </div>

        {/* Working Day Status Badge */}
        <div className="flex items-center gap-2">
          {isWorkingDay ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Working Day
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <CalendarOff size={14} />
              Non-Working Day
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAll}
            className="p-2 text-gray-400 hover:text-white"
            title="Refresh daily schedule"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      </div>

      {/* Non-Working Day State */}
      {!isWorkingDay && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 flex flex-col items-center text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
            {reason?.toLowerCase().includes('holiday') ? (
              <Palmtree size={24} />
            ) : reason?.toLowerCase().includes('exam') ? (
              <GraduationCap size={24} />
            ) : (
              <Sun size={24} />
            )}
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold font-heading text-white">
              No Lectures Today
            </h3>
            <p className="text-sm font-medium text-amber-300">
              {reason || 'Holiday or Weekend'}
            </p>
          </div>
          <p className="text-xs text-amber-300/80 max-w-md">
            The semester calendar marks today as a non-working day. Enjoy your break or review attendance analytics!
          </p>
        </div>
      )}

      {/* Working Day State */}
      {isWorkingDay && (
        <div className="space-y-6">
          {/* Summary Stats Pill Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
              <span className="text-xs text-gray-400">Total Lectures</span>
              <span className="text-base font-bold text-white">{summary.total || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
              <span className="text-xs text-emerald-300">Attended</span>
              <span className="text-base font-bold text-emerald-400">{summary.present || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
              <span className="text-xs text-rose-300">Absent</span>
              <span className="text-base font-bold text-rose-400">{summary.absent || 0}</span>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
              <span className="text-xs text-amber-300">Remaining</span>
              <span className="text-base font-bold text-amber-400">{summary.pending || 0}</span>
            </div>
          </div>

          {/* No Lectures Scheduled on Working Day */}
          {lectures.length === 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
              <BookOpen size={24} className="mx-auto text-gray-400" />
              <p className="text-sm text-gray-300 font-medium">
                No lectures scheduled for {dayOfWeek}.
              </p>
              <p className="text-xs text-gray-500">
                You have a free schedule today according to your weekly timetable.
              </p>
            </div>
          )}

          {/* Chronological Lecture Schedule List */}
          {lectures.length > 0 && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Clock size={14} className="text-indigo-400" />
                <span>Chronological Timeline ({lectures.length} sessions)</span>
              </div>

              <div className="space-y-3">
                {lectures.map((lec, idx) => (
                  <div
                    key={lec.lecture_id || idx}
                    className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    {/* Left Color Accent Bar */}
                    <div
                      className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full"
                      style={{ backgroundColor: lec.color || '#6366f1' }}
                    />

                    {/* Lecture Meta */}
                    <div className="pl-3 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-white font-heading">
                          {lec.subject_name}
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                          style={{
                            backgroundColor: `${lec.color}15`,
                            borderColor: `${lec.color}40`,
                            color: lec.color
                          }}
                        >
                          {lec.lecture_status === 'scheduled' ? 'Lecture' : lec.lecture_status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Faculty: <span className="text-gray-200 font-medium">{lec.faculty_name || 'Staff Member'}</span>
                      </p>
                    </div>

                    {/* Timing & Attendance Controls */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-white/5">
                      {/* Time Badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                        <Clock size={14} />
                        <span>
                          {lec.startTimeFormatted || lec.lecture_start} – {lec.endTimeFormatted || lec.lecture_end}
                        </span>
                        {lec.durationMinutes ? (
                          <span className="text-[10px] text-indigo-400 font-normal">
                            ({lec.durationMinutes}m)
                          </span>
                        ) : null}
                      </div>

                      {/* Interactive Marking or Status Badge */}
                      {interactiveAttendance ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => markLectureStatus(lec.lecture_id, 'present', lec.subject_id)}
                            disabled={updatingLectureId === lec.lecture_id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                              lec.attendance_status === 'present'
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                                : 'bg-white/5 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            <CheckCircle2 size={14} />
                            <span>Present</span>
                          </button>

                          <button
                            onClick={() => markLectureStatus(lec.lecture_id, 'absent', lec.subject_id)}
                            disabled={updatingLectureId === lec.lecture_id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                              lec.attendance_status === 'absent'
                                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400/50'
                                : 'bg-white/5 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}
                          >
                            <XCircle size={14} />
                            <span>Absent</span>
                          </button>
                        </div>
                      ) : (
                        <div>
                          {lec.attendance_status === 'present' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              <CheckCircle2 size={14} />
                              Present
                            </span>
                          )}
                          {lec.attendance_status === 'absent' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-400">
                              <XCircle size={14} />
                              Absent
                            </span>
                          )}
                          {lec.attendance_status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                              <Clock size={14} />
                              Pending
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick link to Today's Attendance page if on Dashboard */}
          {!interactiveAttendance && (
            <div className="pt-2 flex justify-end">
              <Link
                to="/attendance"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <span>Go to Today's Attendance Page</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
