import { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';
import { getSubjectStats, getOverallStats } from '../api/statsApi';
import SubjectStatCard from '../components/dashboard/SubjectStatCard';
import TodayScheduleWidget from '../components/dashboard/TodayScheduleWidget';
import ChartPlaceholder from '../components/dashboard/ChartPlaceholder';
import Button from '../components/common/Button';
import { Card } from '../components/common/Card';
import Skeleton from '../components/common/Skeleton';

export default function Dashboard() {
  const [subjectStats, setSubjectStats] = useState([]);
  const [overallStats, setOverallStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch statistics from backend API
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [subjectsRes, overallRes] = await Promise.all([
        getSubjectStats(),
        getOverallStats(),
      ]);
      setSubjectStats(subjectsRes.data || []);
      setOverallStats(overallRes.data || null);
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
      setError(
        err.response?.data?.message ||
          'Failed to load attendance statistics from backend server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const overallRate = overallStats?.overall_attendance_percentage || 0;

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
              Track overall attendance health, monitor subject metrics, and review live calculations.
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
              onClick={fetchDashboardData}
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
          <Button variant="danger" size="sm" onClick={fetchDashboardData}>
            Retry
          </Button>
        </Card>
      {/* Automatic Daily Schedule Engine Widget */}
      <TodayScheduleWidget onAttendanceUpdated={fetchDashboardData} />

      {/* Metrics Row: Overall Percentage & Key Totals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Overall Percentage Card */}
        <Card hover={false} className="p-5 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Overall Attendance
            </span>
            <div className={`p-2 rounded-xl border ${overallTheme.bgColor} ${overallTheme.borderColor}`}>
              {overallTheme.icon}
            </div>
          </div>

          {loading ? (
            <Skeleton height={36} width="60%" />
          ) : (
            <div className="space-y-1">
              <div className={`text-3xl sm:text-4xl font-extrabold font-heading ${overallTheme.textColor}`}>
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
          {loading ? (
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
          {loading ? (
            <Skeleton height={36} width="50%" />
          ) : (
            <div className="text-3xl font-bold font-heading text-emerald-400">
              {overallStats?.total_present || 0}
            </div>
          )}
          <div className="text-xs text-gray-400">Lectures attended</div>
        </Card>

        {/* Total Absent / Pending Card */}
        <Card hover={false} className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">
              Absent / Pending
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle size={20} />
            </div>
          </div>
          {loading ? (
            <Skeleton height={36} width="50%" />
          ) : (
            <div className="text-3xl font-bold font-heading text-rose-400">
              {overallStats?.total_absent || 0}{' '}
              <span className="text-xs text-amber-400 font-normal">
                ({overallStats?.total_pending || 0} pending)
              </span>
            </div>
          )}
          <div className="text-xs text-gray-400">Missed & unrecorded sessions</div>
        </Card>
      </div>

      {/* Subject Analytics Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/10">
          <div>
            <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
              <BookOpen className="text-indigo-400" size={22} />
              <span>Subject Attendance Overview</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Subject-wise performance highlighted by attendance threshold targets.
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
        {!loading && subjectStats.length > 0 && (
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
              Add your academic subjects and schedule lectures to start generating live attendance statistics.
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

      {/* Chart.js Visualization Placeholders */}
      <div className="space-y-4 pt-4">
        <div className="pb-2 border-b border-white/10">
          <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-purple-400" size={22} />
            <span>Attendance Visualizations</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Interactive chart modules prepared for future Chart.js analytics binding.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartPlaceholder
            title="Weekly Attendance Trends"
            subtitle="Overall student presence progression over time"
            type="line"
          />
          <ChartPlaceholder
            title="Subject Attendance Comparison"
            subtitle="Relative attendance rates across all enrolled subjects"
            type="bar"
          />
        </div>
      </div>
    </div>
  );
}
