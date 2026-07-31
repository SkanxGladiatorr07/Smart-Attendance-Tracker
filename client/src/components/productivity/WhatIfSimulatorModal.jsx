import { useState, useMemo } from 'react';
import {
  Calculator,
  Plus,
  Minus,
  RotateCcw,
  X,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { useAttendance } from '../../context/AttendanceContext';
import { calculatePercentage, calculateRequiredLectures, calculateSafeSkips } from '../../utils/calcUtils';

export default function WhatIfSimulatorModal({ isOpen, onClose }) {
  const { subjectStats, overallStats } = useAttendance();

  const [selectedSubjectId, setSelectedSubjectId] = useState('overall'); // 'overall' or subject_id
  const [testAttendCount, setTestAttendCount] = useState(0);
  const [testMissCount, setTestMissCount] = useState(0);

  const currentSelection = useMemo(() => {
    if (selectedSubjectId === 'overall') {
      return {
        name: 'Overall Attendance',
        present: Number(overallStats?.total_present) || 0,
        absent: Number(overallStats?.total_absent) || 0,
        marked: Number(overallStats?.total_marked) || 0,
        remaining: Number(overallStats?.remaining_lectures) || 0,
        color: '#818cf8',
      };
    }

    const sub = subjectStats.find((s) => String(s.subject_id) === String(selectedSubjectId));
    if (!sub) return null;

    return {
      name: sub.subject_name,
      present: Number(sub.present) || 0,
      absent: Number(sub.absent) || 0,
      marked: Number(sub.marked) || 0,
      remaining: Number(sub.remaining_lectures) || 0,
      color: sub.color || '#6366f1',
    };
  }, [selectedSubjectId, subjectStats, overallStats]);

  // Compute "What If?" hypothetical simulation
  const result = useMemo(() => {
    if (!currentSelection) return null;

    const basePresent = currentSelection.present;
    const baseMarked = currentSelection.marked;
    const currentPct = baseMarked > 0 ? calculatePercentage(basePresent, baseMarked) : 0;

    const simPresent = Math.max(0, basePresent + testAttendCount);
    const simMarked = Math.max(0, baseMarked + testAttendCount + testMissCount);
    const simPercentage = simMarked > 0 ? calculatePercentage(simPresent, simMarked) : 0;

    const diff = Math.round((simPercentage - currentPct) * 10) / 10;

    const simRem = Math.max(0, currentSelection.remaining - (testAttendCount + testMissCount));
    const prediction = calculateRequiredLectures(simPresent, simMarked, 75);
    const safeSkips = calculateSafeSkips(simPresent, simMarked, 75, simRem);

    return {
      currentPct,
      simPercentage,
      diff,
      simPresent,
      simMarked,
      simRem,
      prediction,
      safeSkips,
      isTargetMet: simPercentage >= 75,
    };
  }, [currentSelection, testAttendCount, testMissCount]);

  const handleReset = () => {
    setTestAttendCount(0);
    setTestMissCount(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <Card hover={false} className="max-w-lg w-full p-6 space-y-5 border-indigo-500/30 bg-[#0d121f] shadow-2xl relative overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-indigo-400">
            <Calculator size={22} />
            <h3 className="font-heading font-extrabold text-white text-lg sm:text-xl">
              "What If?" Attendance Simulator
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Target Subject Selector Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300 block">Select Subject or Overall:</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              handleReset();
            }}
            className="w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-semibold focus:outline-none focus:border-indigo-500"
          >
            <option value="overall">Overall Attendance</option>
            {subjectStats.map((s) => (
              <option key={s.subject_id} value={s.subject_id}>
                {s.subject_name} ({s.attendance_percentage}%)
              </option>
            ))}
          </select>
        </div>

        {/* Counter Adjusters Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Test Attended Counter */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 space-y-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 block">
              Simulate Attended (+)
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTestAttendCount((c) => Math.max(0, c - 1))}
                className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg hover:bg-emerald-500/30 active:scale-95"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-extrabold font-heading text-white min-w-[32px]">
                +{testAttendCount}
              </span>
              <button
                type="button"
                onClick={() => setTestAttendCount((c) => c + 1)}
                className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-lg hover:bg-emerald-500/30 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Test Missed Counter */}
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-center">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300 block">
              Simulate Missed (-)
            </span>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setTestMissCount((c) => Math.max(0, c - 1))}
                className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg hover:bg-rose-500/30 active:scale-95"
              >
                <Minus size={16} />
              </button>
              <span className="text-2xl font-extrabold font-heading text-white min-w-[32px]">
                -{testMissCount}
              </span>
              <button
                type="button"
                onClick={() => setTestMissCount((c) => c + 1)}
                className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-lg hover:bg-rose-500/30 active:scale-95"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-300">Projected Attendance:</span>
              <span
                className={`text-xl font-extrabold font-heading ${
                  result.isTargetMet ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.simPercentage}%
              </span>
            </div>

            {/* Shift Diff */}
            <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-white/5">
              <span>Current: {result.currentPct}%</span>
              <span className={result.diff >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {result.diff >= 0 ? `+${result.diff}%` : `${result.diff}%`} change
              </span>
            </div>

            {/* Metrics Impact Summary */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 block">Safe Skips</span>
                <strong className={result.safeSkips.safeSkips > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {result.safeSkips.safeSkips} available
                </strong>
              </div>
              <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                <span className="text-gray-400 block">Required Lecs</span>
                <strong className={result.prediction.requiredLectures > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {result.prediction.requiredLectures > 0 ? `${result.prediction.requiredLectures} needed` : '0 (Target Met)'}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleReset} leftIcon={<RotateCcw size={14} />}>
            Reset Counter
          </Button>

          <Button variant="secondary" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </Card>
    </div>
  );
}
