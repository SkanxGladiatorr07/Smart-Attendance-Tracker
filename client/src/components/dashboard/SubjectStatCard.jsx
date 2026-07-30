import { User, ShieldCheck, AlertTriangle, AlertCircle, Clock, Target, CheckCircle2, Flame } from 'lucide-react';
import { Card } from '../common/Card';
import { calculateRequiredLectures } from '../../utils/calcUtils';

export default function SubjectStatCard({ subject }) {
  const {
    subject_name,
    faculty_name,
    color = '#6366f1',
    total_lectures = 0,
    present = 0,
    absent = 0,
    pending = 0,
    remaining_lectures = pending,
    attendance_percentage = 0,
    prediction: rawPrediction,
  } = subject;

  const remLectures = remaining_lectures !== undefined ? remaining_lectures : pending;
  const marked = present + absent;

  // Use provided prediction or calculate on the fly
  const prediction = rawPrediction || calculateRequiredLectures(present, marked, 75);

  // Threshold highlighting logic
  // Green (>85%), Yellow (75-85%), Red (<75%)
  let theme = {
    badgeText: 'Safe Zone (>85%)',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    progressBar: 'bg-emerald-500',
    icon: <ShieldCheck size={16} className="text-emerald-400" />,
  };

  if (attendance_percentage >= 75 && attendance_percentage <= 85) {
    theme = {
      badgeText: 'Warning Zone (75–85%)',
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      progressBar: 'bg-amber-500',
      icon: <AlertTriangle size={16} className="text-amber-400" />,
    };
  } else if (attendance_percentage < 75) {
    theme = {
      badgeText: 'Critical Zone (<75%)',
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      progressBar: 'bg-rose-500',
      icon: <AlertCircle size={16} className="text-rose-400" />,
    };
  }

  return (
    <Card hover={true} className="relative overflow-hidden space-y-4 transition-all duration-300">
      {/* Top Accent Color Bar */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color }}
      />

      {/* Header: Subject & Threshold Badge */}
      <div className="pt-1 flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <h3 className="font-heading text-lg font-bold text-white tracking-tight truncate">
              {subject_name || 'Untitled Subject'}
            </h3>
          </div>

          {faculty_name && (
            <p className="text-xs text-gray-400 flex items-center gap-1.5 truncate pl-5">
              <User size={13} className="text-gray-500 shrink-0" />
              <span>{faculty_name}</span>
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="shrink-0">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.bgColor} ${theme.borderColor} ${theme.textColor}`}
          >
            {theme.icon}
            <span className="hidden sm:inline">{theme.badgeText}</span>
            <span className="sm:hidden">
              {attendance_percentage > 85 ? '>85%' : attendance_percentage >= 75 ? '75-85%' : '<75%'}
            </span>
          </span>
        </div>
      </div>

      {/* Main Metric & Percentage Row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center sm:text-left">
        <div>
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider block">
            Current
          </span>
          <div className={`text-xl sm:text-2xl font-extrabold font-heading transition-colors duration-300 ${theme.textColor}`}>
            {attendance_percentage}%
          </div>
        </div>

        <div>
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider block">
            Target
          </span>
          <div className="text-xl sm:text-2xl font-bold font-heading text-indigo-300 flex items-center gap-1 justify-center sm:justify-start">
            <Target size={16} className="text-indigo-400" />
            <span>{prediction.targetPercentage || 75}%</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-wider block">
            Present / Total
          </span>
          <div className="text-sm sm:text-base font-bold text-white font-heading">
            <span className={theme.textColor}>{present}</span> / {total_lectures}
          </div>
        </div>
      </div>

      {/* Required Lecture Prediction Engine Callout Pill */}
      <div className="pt-1">
        {prediction.isTargetAchieved ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>Target Met (≥{prediction.targetPercentage}%)</span>
            </div>
            {prediction.safeSkips > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                {prediction.safeSkips} Safe Skip{prediction.safeSkips > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="text-[10px] text-emerald-400/80">On Track</span>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-medium">
              <Flame size={15} className="text-rose-400 shrink-0 animate-bounce" />
              <span>Lectures Needed:</span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1">
              <span>{prediction.requiredLectures} Consecutive</span>
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar Visualizer */}
      <div className="space-y-2 pt-1">
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full ${theme.progressBar} transition-all duration-500`}
            style={{ width: `${Math.min(attendance_percentage, 100)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
          <span>
            <strong className="text-emerald-400">{present}</strong> Present · <strong className="text-rose-400">{absent}</strong> Absent
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Clock size={12} />
            <strong>{remLectures}</strong> Remaining
          </span>
        </div>
      </div>
    </Card>
  );
}
