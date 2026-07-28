import { Clock, Check, X, User, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';

/**
 * Format 24hr HH:MM:SS time string to 12hr AM/PM string
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let hour = parseInt(parts[0], 10);
  const minute = parts[1];
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

export default function AttendanceCard({
  lecture,
  onMarkAttendance,
  isUpdating = false,
}) {
  const {
    lecture_id,
    subject_name,
    faculty_name,
    color = '#6366f1',
    lecture_start,
    lecture_end,
    lecture_status = 'scheduled',
    attendance_status = 'pending',
  } = lecture;

  const startTimeFormatted = formatTime(lecture_start);
  const endTimeFormatted = formatTime(lecture_end);
  const isCancelled = lecture_status === 'cancelled';

  const isPresent = attendance_status === 'present';
  const isAbsent = attendance_status === 'absent';
  const isPending = attendance_status === 'pending';

  return (
    <Card
      hover={!isCancelled}
      className={`relative overflow-hidden transition-all duration-300 ${
        isCancelled ? 'opacity-70 grayscale-[30%]' : ''
      }`}
    >
      {/* Subject Color Top Border Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color }}
      />

      <div className="pt-2 space-y-4">
        {/* Header: Subject & Lecture Type Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight truncate">
                {subject_name || 'Untitled Subject'}
              </h3>
            </div>

            {faculty_name && (
              <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1.5 truncate pl-5">
                <User size={14} className="shrink-0 text-gray-500" />
                <span>{faculty_name}</span>
              </p>
            )}
          </div>

          {/* Lecture Type Badge */}
          <div className="shrink-0">
            {lecture_status === 'extra' ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Extra
              </span>
            ) : isCancelled ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Cancelled
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/5 text-gray-400 border border-white/10">
                Regular
              </span>
            )}
          </div>
        </div>

        {/* Info Row: Time & Attendance Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5 text-sm">
          <div className="flex items-center gap-2 text-gray-300 font-medium bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
            <Clock size={16} className="text-indigo-400" />
            <span>
              {startTimeFormatted} - {endTimeFormatted}
            </span>
          </div>

          {/* Current Attendance Status */}
          <div>
            {isPresent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Present
              </span>
            )}
            {isAbsent && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                Absent
              </span>
            )}
            {isPending && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Pending
              </span>
            )}
          </div>
        </div>

        {/* Mobile One-Handed Action Buttons */}
        {isCancelled ? (
          <div className="pt-2 text-center text-xs text-rose-400 flex items-center justify-center gap-1.5 bg-rose-500/5 py-2.5 rounded-xl border border-rose-500/10">
            <AlertCircle size={14} />
            <span>Attendance marking disabled for cancelled lectures</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              variant={isPresent ? 'primary' : 'outline'}
              size="lg"
              isLoading={isUpdating}
              isDisabled={isUpdating}
              onClick={() => onMarkAttendance(lecture_id, 'present')}
              leftIcon={<Check size={20} />}
              className={`w-full py-3 min-h-[48px] text-sm sm:text-base font-bold rounded-2xl transition-all duration-200 ${
                isPresent
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/40'
                  : 'hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/40 text-gray-300 border-white/10'
              }`}
            >
              {isPresent ? 'Marked Present' : 'Present'}
            </Button>

            <Button
              variant={isAbsent ? 'danger' : 'outline'}
              size="lg"
              isLoading={isUpdating}
              isDisabled={isUpdating}
              onClick={() => onMarkAttendance(lecture_id, 'absent')}
              leftIcon={<X size={20} />}
              className={`w-full py-3 min-h-[48px] text-sm sm:text-base font-bold rounded-2xl transition-all duration-200 ${
                isAbsent
                  ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/40'
                  : 'hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/40 text-gray-300 border-white/10'
              }`}
            >
              {isAbsent ? 'Marked Absent' : 'Absent'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
