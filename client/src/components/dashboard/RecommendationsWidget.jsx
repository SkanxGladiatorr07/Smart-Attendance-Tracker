import { Sparkles, AlertCircle, AlertTriangle, Palmtree, CheckCircle2, XCircle, Clock, MapPin, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';

export default function RecommendationsWidget() {
  const { recommendations, todaySchedule, markLectureStatus, updatingLectureId, loading } = useAttendance();

  if (loading && !recommendations.length) {
    return null;
  }

  const isWorkingDay = todaySchedule?.isWorkingDay !== false;
  const holidayReason = todaySchedule?.reason;

  const criticalCount = recommendations.filter(r => r.level === 'CRITICAL').length;
  const recommendedCount = recommendations.filter(r => r.level === 'RECOMMENDED').length;
  const safeToSkipCount = recommendations.filter(r => r.level === 'SAFE_TO_SKIP').length;

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/20 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b]/40 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400" />
            <span>AttendAI Recommendation Engine</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{"Today's Lecture Recommendations"}</span>
          </h2>
          <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
            AI-driven decision recommendations for today's classes based on current attendance health, safety margins, and semester targets.
          </p>
        </div>

        {/* Priority Counts Summary */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            {criticalCount} Critical
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {recommendedCount} Recommended
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {safeToSkipCount} Safe to Skip
          </span>
        </div>
      </div>

      {/* Non-working Day or Empty Schedule State */}
      {!isWorkingDay ? (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-2">
          <Palmtree size={32} className="text-amber-400 mx-auto" />
          <h3 className="font-heading font-bold text-white text-base">No Recommendations Needed Today</h3>
          <p className="text-xs text-amber-200">{holidayReason || 'Today is a non-working day or holiday.'}</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <CheckCircle2 size={32} className="text-indigo-400 mx-auto" />
          <h3 className="font-heading font-bold text-white text-base">No Lectures Scheduled Today</h3>
          <p className="text-xs text-gray-400">Enjoy your free day! No lecture attendance actions required today.</p>
        </div>
      ) : (
        /* Recommendations List */
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isUpdating = updatingLectureId === rec.lecture_id;
            const currentStatus = rec.attendance_status;

            let theme = {
              cardBg: 'bg-rose-950/20 border-rose-500/30',
              accentBar: 'bg-rose-500',
              badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
              icon: <AlertCircle size={18} className="text-rose-400 shrink-0 animate-pulse" />,
              label: '🔴 CRITICAL',
            };

            if (rec.level === 'RECOMMENDED') {
              theme = {
                cardBg: 'bg-amber-950/20 border-amber-500/30',
                accentBar: 'bg-amber-400',
                badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
                label: '🟡 RECOMMENDED',
              };
            } else if (rec.level === 'SAFE_TO_SKIP') {
              theme = {
                cardBg: 'bg-emerald-950/20 border-emerald-500/30',
                accentBar: 'bg-emerald-400',
                badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                icon: <Palmtree size={18} className="text-emerald-400 shrink-0" />,
                label: '🟢 SAFE TO SKIP',
              };
            }

            return (
              <div
                key={rec.lecture_id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${theme.cardBg} space-y-3 overflow-hidden`}
              >
                {/* Left Colored Accent Stripe */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${theme.accentBar}`} />

                {/* Top Row: Title, Time & Recommendation Level Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: rec.color }} />
                      <h3 className="font-heading font-bold text-white text-base">
                        {rec.subject_name}
                      </h3>
                      {rec.lecture_type && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white/10 text-gray-300 border border-white/10">
                          {rec.lecture_type}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 pl-4">
                      {rec.startTimeFormatted && (
                        <span className="flex items-center gap-1 text-gray-300 font-medium">
                          <Clock size={13} className="text-indigo-400" />
                          {rec.startTimeFormatted} {rec.endTimeFormatted ? `- ${rec.endTimeFormatted}` : ''}
                        </span>
                      )}
                      {rec.room_number && (
                        <span className="flex items-center gap-1 text-gray-400">
                          <MapPin size={13} className="text-gray-500" />
                          Room {rec.room_number}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Level Badge */}
                  <div className="shrink-0 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
                      {theme.icon}
                      <span>{theme.title}</span>
                    </span>
                  </div>
                </div>

                {/* Middle Row: Detailed Reason Callout */}
                <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-gray-200 leading-relaxed ml-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-gray-400 pb-1 border-b border-white/5">
                    <span>Current: <strong className="text-white">{rec.current_percentage}%</strong></span>
                    <span>Target: <strong className="text-indigo-300">{rec.target_percentage}%</strong></span>
                    {rec.safe_skips > 0 ? (
                      <span className="text-emerald-400">{rec.safe_skips} Safe Skips</span>
                    ) : (
                      <span className="text-rose-400">0 Safe Skips</span>
                    )}
                  </div>
                  <p className="pt-0.5">{rec.reason}</p>
                </div>

                {/* Bottom Row: Quick Action Attendance Buttons */}
                <div className="flex items-center justify-between pt-1 pl-2 gap-3">
                  <div className="text-xs text-gray-400">
                    Status: {' '}
                    <span className={`font-semibold capitalize ${
                      currentStatus === 'present' ? 'text-emerald-400' : currentStatus === 'absent' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {currentStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => markLectureStatus(rec.lecture_id, 'present', rec.subject_id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        currentStatus === 'present'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <CheckCircle2 size={14} />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => markLectureStatus(rec.lecture_id, 'absent', rec.subject_id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        currentStatus === 'absent'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <XCircle size={14} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
