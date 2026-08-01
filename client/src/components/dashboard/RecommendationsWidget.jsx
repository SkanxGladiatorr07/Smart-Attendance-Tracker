import { memo } from 'react';
import { Sparkles, AlertCircle, AlertTriangle, Palmtree, CheckCircle2, XCircle, Clock, MapPin, Target, Flame, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';

function RecommendationsWidget() {
  const { recommendations, todaySchedule, markLectureStatus, updatingLectureId, loading } = useAttendance();

  if (loading && !recommendations.length) {
    return null;
  }

  const isWorkingDay = todaySchedule?.isWorkingDay !== false;
  const holidayReason = todaySchedule?.reason;

  const mustAttendCount = recommendations.filter(r => r.level === 'MUST_ATTEND' || r.level === 'CRITICAL').length;
  const recommendedCount = recommendations.filter(r => r.level === 'RECOMMENDED').length;
  const safeToSkipCount = recommendations.filter(r => r.level === 'SAFE_TO_SKIP').length;

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/20 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e1b4b]/40 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} className="text-indigo-400 animate-pulse" />
            <span>AttendAI Smart Decision Engine</span>
          </div>
          <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{"Today's Lecture Recommendations"}</span>
          </h2>
          <p className="text-xs text-gray-300">
            Real-time AI priorities calculated based on current attendance percentage, upcoming remaining lectures, and the 75% goal threshold.
          </p>
        </div>

        {isWorkingDay && recommendations.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {mustAttendCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
                <Flame size={14} className="text-rose-400" />
                <span>{mustAttendCount} Must Attend</span>
              </span>
            )}
            {recommendedCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
                <AlertTriangle size={14} className="text-amber-400" />
                <span>{recommendedCount} Recommended</span>
              </span>
            )}
            {safeToSkipCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>{safeToSkipCount} Safe to Skip</span>
              </span>
            )}
          </div>
        )}
      </div>

      {!isWorkingDay ? (
        <div className="p-8 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
            <Palmtree size={24} />
          </div>
          <h3 className="font-heading text-lg font-bold text-white">
            No Attendance Recommendations Required Today
          </h3>
          <p className="text-xs text-amber-200/80 max-w-md mx-auto leading-relaxed">
            {holidayReason || 'Today is a scheduled holiday or non-working day. Enjoy your break!'}
          </p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
          <p className="text-xs text-gray-400">Enjoy your free day! No lecture attendance actions required today.</p>
        </div>
      ) : (
        /* Priority Recommendation Cards */
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isUpdating = updatingLectureId === rec.lecture_id;
            const currentStatus = rec.attendance_status;

            let theme = {
              cardBg: 'bg-rose-950/25 border-rose-500/30',
              accentBar: 'bg-rose-500',
              badgeBg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
              icon: <Flame size={18} className="text-rose-400 shrink-0 animate-bounce" />,
              title: '🔴 Must Attend',
            };

            if (rec.level === 'RECOMMENDED') {
              theme = {
                cardBg: 'bg-amber-950/25 border-amber-500/30',
                accentBar: 'bg-amber-400',
                badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
                icon: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
                title: '🟡 Recommended',
              };
            } else if (rec.level === 'SAFE_TO_SKIP') {
              theme = {
                cardBg: 'bg-emerald-950/25 border-emerald-500/30',
                accentBar: 'bg-emerald-400',
                badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                icon: <Palmtree size={18} className="text-emerald-400 shrink-0" />,
                title: '🟢 Safe to Skip',
              };
            }

            return (
              <div
                key={rec.lecture_id}
                className={`relative p-5 rounded-2xl border transition-all duration-300 ${theme.cardBg} space-y-3.5 overflow-hidden`}
              >
                {/* Left Accent Bar */}
                <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${theme.accentBar}`} />

                {/* Top Row: Title, Time & Priority Level Badge */}
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

                  {/* Priority Badge */}
                  <div className="shrink-0 self-start sm:self-auto">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${theme.badgeBg}`}>
                      {theme.icon}
                      <span>{theme.title}</span>
                    </span>
                  </div>
                </div>

                {/* Middle Row: Analyzed Metrics & Reason */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-200 leading-relaxed ml-2 space-y-2">
                  {/* Analyzed 4 Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2 border-b border-white/10 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Current</span>
                      <strong className={rec.current_percentage >= 75 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {rec.current_percentage}%
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Safe Skips</span>
                      <strong className={rec.safe_skips > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {rec.safe_skips} available
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Required Lecs</span>
                      <strong className={rec.required_lectures > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {rec.required_lectures > 0 ? `${rec.required_lectures} needed` : '0 (On track)'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Remaining</span>
                      <strong className="text-amber-300 font-bold">
                        {rec.remaining_lectures} in semester
                      </strong>
                    </div>
                  </div>

                  {/* AI Reason Text */}
                  <p className="pt-0.5 text-gray-200">
                    <strong className="text-indigo-300">Reason: </strong>
                    {rec.reason}
                  </p>
                </div>

                {/* Bottom Row: Quick Action Attendance Buttons */}
                <div className="flex items-center justify-between pt-1 pl-2 gap-3">
                  <div className="text-xs text-gray-400">
                    Attendance Status: {' '}
                    <span className={`font-bold capitalize ${
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

export default memo(RecommendationsWidget);
