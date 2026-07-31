import { useMemo } from 'react';
import { Sparkles, AlertTriangle, CheckCircle2, ArrowRight, X, Palmtree } from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { calculatePercentage } from '../../utils/calcUtils';

export default function CanISkipTodayModal({ isOpen, onClose }) {
  const { todaySchedule, overallStats, subjectStats } = useAttendance();

  // Compute sandbox simulation of skipping all remaining (pending) lectures today
  const simulation = useMemo(() => {
    if (!todaySchedule || !overallStats) return null;

    const lectures = todaySchedule.lectures || [];
    const pendingLectures = lectures.filter((l) => l.attendance_status === 'pending');
    const pendingCount = pendingLectures.length;

    const currentPresent = Number(overallStats.total_present) || 0;
    const currentAbsent = Number(overallStats.total_absent) || 0;
    const currentMarked = currentPresent + currentAbsent;
    const currentPercentage = currentMarked > 0 ? calculatePercentage(currentPresent, currentMarked) : 0;

    // Simulate missing all pending lectures today
    const simulatedPresent = currentPresent;
    const simulatedAbsent = currentAbsent + pendingCount;
    const simulatedMarked = simulatedPresent + simulatedAbsent;
    const simulatedPercentage = simulatedMarked > 0 ? calculatePercentage(simulatedPresent, simulatedMarked) : 0;

    // Evaluate subject-by-subject impact
    const subjectMap = new Map();
    subjectStats.forEach((s) => subjectMap.set(String(s.subject_id), { ...s }));

    const affectedSubjects = [];
    pendingLectures.forEach((lec) => {
      const sub = subjectMap.get(String(lec.subject_id));
      if (sub) {
        const subPresent = Number(sub.present) || 0;
        const subAbsent = Number(sub.absent) || 0;
        const subMarked = subPresent + subAbsent;
        const currentSubPct = subMarked > 0 ? calculatePercentage(subPresent, subMarked) : 0;

        // Add 1 simulated absence
        const simSubAbsent = subAbsent + 1;
        const simSubMarked = subPresent + simSubAbsent;
        const simSubPct = calculatePercentage(subPresent, simSubMarked);

        affectedSubjects.push({
          subject_name: sub.subject_name,
          color: sub.color,
          currentSubPct,
          simSubPct,
          breachesTarget: simSubPct < 75,
        });
      }
    });

    const breachesCount = affectedSubjects.filter((s) => s.breachesTarget).length;
    const isSafeOverall = simulatedPercentage >= 75 && breachesCount === 0;

    return {
      pendingCount,
      pendingLectures,
      currentPercentage,
      simulatedPercentage,
      dropPct: Math.round((currentPercentage - simulatedPercentage) * 10) / 10,
      affectedSubjects,
      breachesCount,
      isSafeOverall,
    };
  }, [todaySchedule, overallStats, subjectStats]);

  if (!isOpen || !simulation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <Card hover={false} className="max-w-lg w-full p-6 space-y-5 border-indigo-500/30 bg-[#0d121f] shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-indigo-400">
            <Palmtree size={22} />
            <h3 className="font-heading font-extrabold text-white text-lg sm:text-xl">
              "Can I Skip Today?" Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Sandbox Notice */}
        <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
          <Sparkles size={16} className="text-indigo-400 shrink-0" />
          <span>This is a sandbox simulation. No actual attendance records will be changed.</span>
        </div>

        {/* Main Verdict Result Card */}
        {simulation.pendingCount === 0 ? (
          <div className="p-6 text-center rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <CheckCircle2 size={36} className="text-emerald-400 mx-auto" />
            <h4 className="font-heading font-bold text-white text-base">No Remaining Lectures Today</h4>
            <p className="text-xs text-gray-400">All lectures for today have already been marked or none remain!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Outcome Callout Box */}
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                simulation.isSafeOverall
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              }`}
            >
              <div className="flex items-center justify-between font-extrabold text-sm">
                <span className="flex items-center gap-2">
                  {simulation.isSafeOverall ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={20} className="text-rose-400" />
                  )}
                  <span>{simulation.isSafeOverall ? 'YES, SAFE TO SKIP TODAY' : 'NOT RECOMMENDED TO SKIP'}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-white/10 border border-white/10">
                  {simulation.pendingCount} Pending Lecture{simulation.pendingCount > 1 ? 's' : ''}
                </span>
              </div>

              <p className="leading-relaxed">
                If you miss all <strong>{simulation.pendingCount} remaining lecture(s) today</strong>, your overall attendance will shift from{' '}
                <strong>{simulation.currentPercentage}%</strong> to{' '}
                <strong className={simulation.simulatedPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'}>
                  {simulation.simulatedPercentage}%
                </strong>{' '}
                (a drop of {simulation.dropPct}%).
              </p>
            </div>

            {/* Simulated Subjects Breakdown List */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-gray-300">Simulated Subject Impact:</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {simulation.affectedSubjects.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                      <span className="font-semibold text-white truncate">{sub.subject_name}</span>
                    </div>

                    <div className="flex items-center gap-2 text-right shrink-0">
                      <span className="text-gray-400">{sub.currentSubPct}%</span>
                      <ArrowRight size={12} className="text-gray-500" />
                      <span className={`font-bold ${sub.breachesTarget ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {sub.simSubPct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Action */}
        <div className="pt-2 border-t border-white/10 text-right">
          <Button variant="secondary" size="md" onClick={onClose}>
            Close Simulation
          </Button>
        </div>
      </Card>
    </div>
  );
}
