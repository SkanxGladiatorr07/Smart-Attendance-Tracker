import { Palmtree, ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '../common/Card';
import { useAttendance } from '../../context/AttendanceContext';
import { calculateSafeSkips } from '../../utils/calcUtils';

export default function SafeSkipCalculatorCard() {
  const { subjectStats, overallStats, loading } = useAttendance();

  if (loading && !subjectStats.length) {
    return null;
  }

  const overallSafeSkips = overallStats?.safeSkips || calculateSafeSkips(
    overallStats?.total_present || 0,
    overallStats?.total_marked || ((overallStats?.total_present || 0) + (overallStats?.total_absent || 0)),
    75,
    overallStats?.remaining_lectures
  );

  return (
    <Card hover={false} className="p-6 space-y-6 border-emerald-500/20 bg-gradient-to-b from-[#064e3b]/20 via-[#0f172a] to-[#111827] shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Palmtree size={15} />
            <span>Safe Skip Calculator Engine</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={22} className="text-emerald-400" />
            <span>Safe Skips Remaining (75% Threshold)</span>
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
            Maximum number of future lectures you can safely miss for each subject while keeping attendance above 75%.
          </p>
        </div>

        {/* Overall Safe Skips Pill */}
        <div className="shrink-0">
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {overallSafeSkips.safeSkips}
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-400/80 block">Overall Safe Skips</span>
              <span className="text-xs font-bold text-white">
                {overallSafeSkips.safeSkips > 0 ? `${overallSafeSkips.safeSkips} Missable Lecture(s)` : '0 Skips (At/Below 75%)'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject Wise Safe Skips Grid */}
      {subjectStats.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectStats.map((sub) => {
            const currentPct = sub.attendance_percentage || 0;
            const marked = (sub.present || 0) + (sub.absent || 0);
            const skipsObj = sub.safeSkips || calculateSafeSkips(sub.present || 0, marked, 75, sub.remaining_lectures);

            let statusBadge = {
              bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
              icon: <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />,
              text: `${skipsObj.safeSkips} Safe Skip${skipsObj.safeSkips > 1 ? 's' : ''}`,
            };

            if (currentPct < 75) {
              statusBadge = {
                bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
                icon: <AlertCircle size={15} className="text-rose-400 shrink-0" />,
                text: '0 Skips (Below 75%)',
              };
            } else if (skipsObj.safeSkips === 0) {
              statusBadge = {
                bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                icon: <AlertTriangle size={15} className="text-amber-400 shrink-0" />,
                text: '0 Skips (At 75% Limit)',
              };
            }

            return (
              <div
                key={sub.subject_id}
                className="relative p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] border border-white/10 transition-all duration-200 space-y-3"
              >
                {/* Accent Top Bar */}
                <div
                  className="absolute top-0 left-4 right-4 h-1 rounded-b-full"
                  style={{ backgroundColor: sub.color || '#6366f1' }}
                />

                <div className="flex items-start justify-between gap-2 pt-1">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: sub.color || '#6366f1' }}
                      />
                      <h4 className="font-heading font-bold text-white text-sm truncate">
                        {sub.subject_name}
                      </h4>
                    </div>
                    {sub.faculty_name && (
                      <p className="text-[11px] text-gray-400 truncate pl-4">
                        {sub.faculty_name}
                      </p>
                    )}
                  </div>

                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.bg} shrink-0`}>
                    {statusBadge.icon}
                    <span>{statusBadge.text}</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                  <span className="text-gray-400">
                    Current: <strong className="text-white">{currentPct}%</strong>
                  </span>
                  <span className="text-gray-400 flex items-center gap-1">
                    <Clock size={12} className="text-amber-300" />
                    Target: <strong className="text-indigo-300">75%</strong>
                  </span>
                </div>

                <p className="text-[11px] text-gray-400 leading-snug">
                  {skipsObj.message}
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-gray-400 text-center py-4">
          No subject attendance data available yet.
        </p>
      )}
    </Card>
  );
}
