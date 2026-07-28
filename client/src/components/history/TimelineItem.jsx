import { Clock, User, Edit3, Trash2 } from 'lucide-react';
import { Card } from '../common/Card';

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

export default function TimelineItem({ record, onEdit, onDelete }) {
  const {
    subject_name,
    faculty_name,
    color = '#6366f1',
    lecture_start,
    lecture_end,
    lecture_status = 'scheduled',
    attendance_status = 'pending',
  } = record;

  const startTime = formatTime(lecture_start);
  const endTime = formatTime(lecture_end);

  const isPresent = attendance_status === 'present';
  const isAbsent = attendance_status === 'absent';
  const isPending = attendance_status === 'pending';

  return (
    <div className="relative pl-6 sm:pl-8 group">
      {/* Vertical Timeline Dot Connector */}
      <div
        className={`absolute left-0 top-6 -translate-x-[5px] sm:-translate-x-[6px] w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 border-slate-900 shadow-md transition-transform duration-200 group-hover:scale-125 z-10 ${
          isPresent
            ? 'bg-emerald-400 ring-4 ring-emerald-500/20'
            : isAbsent
            ? 'bg-rose-400 ring-4 ring-rose-500/20'
            : 'bg-amber-400 ring-4 ring-amber-500/20'
        }`}
      />

      <Card
        hover={true}
        className="relative overflow-hidden border border-white/10 transition-all duration-200"
      >
        {/* Subject Accent Bar */}
        <div
          className="absolute top-0 left-0 bottom-0 w-1.5"
          style={{ backgroundColor: color }}
        />

        <div className="pl-2 space-y-3">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />
                <h4 className="font-heading font-bold text-white text-base sm:text-lg tracking-tight truncate">
                  {subject_name || 'Untitled Subject'}
                </h4>
              </div>

              {faculty_name && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate pl-4">
                  <User size={13} className="text-gray-500 shrink-0" />
                  <span>{faculty_name}</span>
                </p>
              )}
            </div>

            {/* Attendance Status Badge */}
            <div className="shrink-0 flex items-center gap-2">
              {isPresent && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Present
                </span>
              )}
              {isAbsent && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  Absent
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Pending
                </span>
              )}
            </div>
          </div>

          {/* Time & Action Controls Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-gray-400">
            <div className="flex items-center gap-1.5 font-medium text-gray-300">
              <Clock size={14} className="text-indigo-400" />
              <span>
                {startTime} - {endTime}
              </span>
              {lecture_status === 'extra' && (
                <span className="ml-2 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-indigo-500/20 text-indigo-300">
                  Extra
                </span>
              )}
            </div>

            {/* Edit / Delete Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(record)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-white/5 transition-all"
                title="Edit Attendance"
              >
                <Edit3 size={15} />
              </button>

              {record.id && (
                <button
                  onClick={() => onDelete(record)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-white/5 transition-all"
                  title="Delete Attendance Record"
                >
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
