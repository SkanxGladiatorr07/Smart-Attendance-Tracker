import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Flame,
  ShieldCheck,
  Palmtree,
  Calculator,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import CanISkipTodayModal from './CanISkipTodayModal';
import { useAttendance } from '../../context/AttendanceContext';
import PendingSyncBadge from '../common/PendingSyncBadge';

export default function TodayHomeSection() {
  const {
    todaySchedule,
    overallStats,
    subjectStats,
    semesterProgress,
    markLectureStatus,
    updatingLectureId,
    loading,
  } = useAttendance();

  const [skipModalOpen, setSkipModalOpen] = useState(false);
  const [whatIfModalOpen, setWhatIfModalOpen] = useState(false);

  // 2. Current overall attendance
  const overallPercentage = overallStats?.overall_attendance_percentage || 0;

  // 3. Subject requiring the most attention (lowest % or most required lectures)
  const subjectMostAttention = useMemo(() => {
    if (!subjectStats || subjectStats.length === 0) return null;
    const sorted = [...subjectStats].sort((a, b) => {
      const aReq = a.prediction?.requiredLectures || 0;
      const bReq = b.prediction?.requiredLectures || 0;
      if (aReq !== bReq) return bReq - aReq; // Highest required first
      return (a.attendance_percentage || 0) - (b.attendance_percentage || 0); // Lowest % first
    });
    return sorted[0];
  }, [subjectStats]);

  // 5 & 6. Semester remaining working days & remaining lectures
  const workingDaysRemaining = semesterProgress?.workingDaysRemaining || 0;
  const remainingLectures = semesterProgress?.remainingLectures || overallStats?.remaining_lectures || 0;

  // 1. Chronological Lectures List
  const lectures = todaySchedule?.lectures || [];

  return (
    <div className="space-y-6">
      {/* 1-Tap Interactive Simulator Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Can I Skip Today Button */}
        <button
          type="button"
          onClick={() => setSkipModalOpen(true)}
          className="p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 to-[#0b0f19] border border-indigo-500/30 hover:border-indigo-500/60 text-left flex items-center justify-between gap-3 shadow-lg hover:shadow-indigo-500/10 transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Palmtree size={22} />
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-sm block">
                Can I Skip Today?
              </span>
              <span className="text-[11px] text-gray-400">
                Simulate missing today's remaining lectures
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
            Simulate →
          </span>
        </button>

        {/* What If? Simulator Button */}
        <button
          type="button"
          onClick={() => setWhatIfModalOpen(true)}
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/60 to-[#0b0f19] border border-purple-500/30 hover:border-purple-500/60 text-left flex items-center justify-between gap-3 shadow-lg hover:shadow-purple-500/10 transition-all active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calculator size={22} />
            </div>
            <div>
              <span className="font-heading font-extrabold text-white text-sm block">
                "What If?" Simulator
              </span>
              <span className="text-[11px] text-gray-400">
                Test attending or missing future classes
              </span>
            </div>
          </div>
          <span className="text-xs font-bold text-purple-400 group-hover:translate-x-1 transition-transform">
            Test →
          </span>
        </button>
      </div>

      {/* Today at a Glance Summary Grid (One-Handed Mobile Friendly) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Current Overall Attendance */}
        <Card hover={false} className="p-4 space-y-2 border-indigo-500/20 bg-[#0d121f]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block">
            Overall Attendance
          </span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-extrabold font-heading ${
              overallPercentage >= 75 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {overallPercentage}%
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Target 75%
            </span>
          </div>
        </Card>

        {/* Card 2: Attention Required Subject */}
        <Card hover={false} className="p-4 space-y-2 border-rose-500/20 bg-[#0d121f]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
            <Flame size={13} />
            Most Attention Needed
          </span>
          <div className="truncate">
            <span className="font-heading font-bold text-white text-sm truncate block">
              {subjectMostAttention?.subject_name || 'All On Track'}
            </span>
            <span className="text-[11px] text-gray-400">
              {subjectMostAttention
                ? `${subjectMostAttention.attendance_percentage}% (${subjectMostAttention.prediction?.requiredLectures || 0} needed)`
                : 'No critical subjects'}
            </span>
          </div>
        </Card>

        {/* Card 3: Working Days Left */}
        <Card hover={false} className="p-4 space-y-2 border-white/10 bg-[#0d121f]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block">
            Semester Days Left
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              {workingDaysRemaining}
            </span>
            <span className="text-xs text-gray-400 font-semibold">working days</span>
          </div>
        </Card>

        {/* Card 4: Total Lectures Left */}
        <Card hover={false} className="p-4 space-y-2 border-white/10 bg-[#0d121f]">
          <span className="text-[11px] uppercase font-bold tracking-wider text-gray-400 block">
            Semester Lectures Left
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-300">
              {remainingLectures}
            </span>
            <span className="text-xs text-gray-400 font-semibold">lectures</span>
          </div>
        </Card>
      </div>

      {/* 4. Safe Skips Remaining Per Subject (Pill Grid) */}
      <Card hover={false} className="p-5 border-white/10 bg-[#0d121f] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-white flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span>Safe Skips Remaining per Subject</span>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {subjectStats.map((sub) => {
            const skips = sub.safeSkips?.safeSkips || 0;
            return (
              <div
                key={sub.subject_id}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                  skips > 0
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sub.color }} />
                <span>{sub.subject_name}:</span>
                <strong className={skips > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {skips > 0 ? `${skips} Skips` : '0 Skips'}
                </strong>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 1. Today's Lectures in Chronological Order with 1-Tap Attendance Actions */}
        <Card hover={false} className="p-6 space-y-4 border-indigo-500/20 bg-[#0d121f]">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Clock size={18} className="text-indigo-400" />
                <span>Today's Chronological Schedule</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                1-tap attendance marking for today's classes in chronological order.
              </p>
            </div>
            <PendingSyncBadge />
          </div>

        {lectures.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/5 text-gray-400 text-xs space-y-1">
            <p className="font-bold text-white text-sm">No lectures scheduled for today.</p>
            <p>Enjoy your free day!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lectures.map((lec) => {
              const isUpdating = updatingLectureId === lec.lecture_id;
              const status = lec.attendance_status || 'pending';

              return (
                <div
                  key={lec.lecture_id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: lec.color || '#6366f1' }}
                        />
                        <h4 className="font-heading text-sm sm:text-base font-bold text-white">
                          {lec.subject_name}
                        </h4>
                      </div>
                      <p className="text-xs text-gray-400 pl-4 flex items-center gap-2">
                        <span>{lec.startTimeFormatted || lec.lecture_start} - {lec.endTimeFormatted || lec.lecture_end}</span>
                        {lec.faculty_name && <span>• {lec.faculty_name}</span>}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase border shrink-0 ${
                        status === 'present'
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : status === 'absent'
                          ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* 1-Tap Attendance Mark Buttons */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => markLectureStatus(lec.lecture_id, 'present', lec.subject_id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        status === 'present'
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      <span>Present</span>
                    </button>

                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => markLectureStatus(lec.lecture_id, 'absent', lec.subject_id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        status === 'absent'
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                          : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      <XCircle size={16} />
                      <span>Absent</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Simulators Modals */}
      <CanISkipTodayModal isOpen={skipModalOpen} onClose={() => setSkipModalOpen(false)} />
      <WhatIfSimulatorModal isOpen={whatIfModalOpen} onClose={() => setWhatIfModalOpen(false)} />
    </div>
  );
}
