import { Link } from 'react-router-dom';
import {
  BookOpen,
  UserCheck,
  TrendingUp,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Plus,
  Target,
  Flame,
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import SubjectStatCard from '../components/dashboard/SubjectStatCard';
import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';
import SafeSkipCalculatorCard from '../components/dashboard/SafeSkipCalculatorCard';
import RecommendationsWidget from '../components/dashboard/RecommendationsWidget';
import TodayHomeSection from '../components/productivity/TodayHomeSection';
import ChartPlaceholder from '../components/dashboard/ChartPlaceholder';
import AttendAIAnalyticsDashboard from '../components/analytics/AttendAIAnalyticsDashboard';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';
import { calculateRequiredLectures } from '../utils/calcUtils';

export default function Dashboard() {
  const {
    subjectStats,
    overallStats,
    loading,
    error,
    refreshAll,
  } = useAttendance();

  const overallRate = overallStats?.overall_attendance_percentage || 0;
  const overallPrediction = overallStats?.prediction || calculateRequiredLectures(
    overallStats?.total_present || 0,
    overallStats?.total_marked || ((overallStats?.total_present || 0) + (overallStats?.total_absent || 0)),
    75
  );

  // Threshold theme logic for Overall Attendance Rate
  let overallTheme = {
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    badgeText: 'Safe Zone (>85%)',
    icon: <ShieldCheck size={18} className="text-emerald-400" />,
  };

  if (overallRate >= 75 && overallRate <= 85) {
    overallTheme = {
      textColor: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      badgeText: 'Warning Zone (75–85%)',
      icon: <AlertTriangle size={18} className="text-amber-400" />,
    };
  } else if (overallRate < 75) {
    overallTheme = {
      textColor: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/30',
      badgeText: 'Critical Zone (<75%)',
      icon: <AlertCircle size={18} className="text-rose-400" />,
    };
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Hero Welcome Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 via-[#0b0f19] to-purple-900/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} />
              <span>AttendAI Attendance Engine</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Attendance Dashboard & Analytics
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              Track overall attendance health, monitor semester progress, review AI daily recommendations, calculate safe skips, and analyze predictions in real time.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                to="/attendance"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
              >
                <UserCheck size={16} />
                <span>{"Today's Attendance"}</span>
              </Link>

              <Link
                to="/subjects"
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm border border-white/10 flex items-center gap-2 transition-all"
              >
                <BookOpen size={16} />
                <span>Manage Subjects</span>
              </Link>
            </div>
          </div>

          {/* Quick Refresh */}
          <div className="self-end md:self-auto">
            <Button
              variant="secondary"
              size="md"
              onClick={refreshAll}
              isLoading={loading}
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh Stats
            </Button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Card
          hover={false}
          className="p-4 border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="danger" size="sm" onClick={refreshAll}>
            Retry
          </Button>
        </Card>
      )}

      {/* Personal Productivity Today Home Section */}
      <TodayHomeSection />

      {/* Semester Progress & Calendar Dashboard Widget */}
      <SemesterProgressWidget />

      {/* AttendAI Daily Lecture Recommendations Widget */}
      <RecommendationsWidget />

      {/* Automatic Daily Schedule Engine Widget */}
      <TodayScheduleWidget />

      {/* Metrics Row: Overall Percentage & Key Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Percentage Card */}
        <Card hover={false} className="p-5 space-y-3 relative overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Overall Attendance
            </span>
            <div className={`p-2 rounded-xl border ${overallTheme.bgColor} ${overallTheme.borderColor}`}>
              {overallTheme.icon}
            </div>
          </div>

          {loading && !overallStats ? (
            <Skeleton height={36} width="60%" />
          ) : (
            <div className="space-y-1">
              <div className={`text-3xl sm:text-4xl font-extrabold font-heading transition-colors duration-300 ${overallTheme.textColor}`}>
                {overallRate}%
              </div>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${overallTheme.bgColor} ${overallTheme.borderColor} ${overallTheme.textColor}`}
              >
                {overallTheme.badgeText}
              </span>
            </div>
          )}
        </Card>

        {/* Total Lectures Card */}
        <Card hover={false} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Total Lectures
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>
          {loading && !overallStats ? (
            <Skeleton height={36} width="50%" />
          ) : (
            <div className="text-3xl font-bold font-heading text-white">
              {overallStats?.total_lectures || 0}
            </div>
          )}
          <div className="text-xs text-gray-400">Scheduled active lectures</div>
        </Card>

        {/* Total Present Card */}
        <Card hover={false} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Total Present
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
          {loading && !overallStats ? (
            <Skeleton height={36} width="50%" />
          ) : (
            <div className="text-3xl font-bold font-heading text-emerald-400 transition-all duration-300">
              {overallStats?.total_present || 0}
            </div>
          )}
          <div className="text-xs text-gray-400">Lectures attended</div>
        </Card>

        {/* Total Absent / Remaining Card */}
        <Card hover={false} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Absent & Remaining
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle size={20} />
            </div>
          </div>
          {loading && !overallStats ? (
            <Skeleton height={36} width="50%" />
          ) : (
            <div className="text-3xl font-bold font-heading text-rose-400 transition-all duration-300">
              {overallStats?.total_absent || 0}{' '}
              <span className="text-xs text-amber-400 font-normal">
                ({overallStats?.remaining_lectures ?? overallStats?.total_pending ?? 0} remaining)
              </span>
            </div>
          )}
          <div className="text-xs text-gray-400">Missed & upcoming sessions</div>
        </Card>
      </div>

      {/* Required Lecture Prediction Banner */}
      <Card hover={false} className="p-5 border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
              <Target size={14} />
              <span>Required Lecture Prediction Engine</span>
            </div>
            <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
              <span>Overall Target Goal: 75% Attendance</span>
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed max-w-xl">
              {overallPrediction.message}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            {overallPrediction.isTargetAchieved ? (
              <div className="px-4 py-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 size={18} />
                <span>Overall Target Achieved</span>
              </div>
            ) : (
              <div className="px-4 py-2 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-600/30 flex items-center gap-2">
                <Flame size={18} className="animate-bounce" />
                <span>Need {overallPrediction.requiredLectures} Consecutive Lectures</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Safe Skip Calculator Card */}
      <SafeSkipCalculatorCard />

      {/* Subject Analytics Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-indigo-400" size={22} />
              <span>Subject Attendance & Prediction Overview</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Subject-wise performance with live target predictions (75% threshold).
            </p>
          </div>

          {/* Threshold Legend */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              Green (&gt;85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              Yellow (75-85%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              Red (&lt;75%)
            </span>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && subjectStats.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3].map((n) => (
              <Card key={n} hover={false} className="p-6 space-y-4">
                <Skeleton height={20} width="70%" />
                <Skeleton height={32} width="40%" className="mt-2" />
                <Skeleton height={12} className="mt-4" />
              </Card>
            ))}
          </div>
        )}

        {/* Subject Cards Grid */}
        {subjectStats.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {subjectStats.map((subject) => (
              <SubjectStatCard key={subject.subject_id} subject={subject} />
            ))}
          </div>
        )}

        {/* Empty Subjects State */}
        {!loading && subjectStats.length === 0 && !error && (
          <Card hover={false} className="p-10 text-center max-w-lg mx-auto border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mx-auto flex items-center justify-center mb-3">
              <BookOpen size={28} />
            </div>
            <h3 className="font-heading text-lg font-bold text-white mb-1">
              No Subjects Configured Yet
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-5 leading-relaxed">
              Add your academic subjects and schedule lectures to start generating live attendance statistics and predictions.
            </p>
            <Link
              to="/subjects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              <Plus size={16} />
              <span>Add Subject</span>
            </Link>
          </Card>
        )}
      </div>

      {/* AttendAI Visual Analytics Dashboard */}
      <div className="pt-4">
        <AttendAIAnalyticsDashboard />
      </div>
    </div>
  );
}
