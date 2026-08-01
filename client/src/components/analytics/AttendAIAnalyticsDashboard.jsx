import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  RefreshCw,
  Sparkles,
  PieChart,
  BarChart2,
  Calendar,
  Target,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import SubjectWiseBarChart from '../charts/SubjectWiseBarChart';
import MonthlyTrendLineChart from '../charts/MonthlyTrendLineChart';
import AttendancePieChart from '../charts/AttendancePieChart';
import SemesterProgressionChart from '../charts/SemesterProgressionChart';
import DailyTrendChart from '../charts/DailyTrendChart';
import { getAnalyticsData } from '../../api/statsApi';
import { useAttendance } from '../../context/AttendanceContext';

export default function AttendAIAnalyticsDashboard() {
  const { subjectStats, overallStats } = useAttendance();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAnalyticsData();
      setAnalyticsData(res.data || null);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(
        err.response?.data?.message || 'Failed to fetch analytics data from server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const subjectComparison = analyticsData?.subjectComparison || subjectStats || [];
  const distribution = analyticsData?.overallDistribution || {
    present: overallStats?.total_present || 0,
    absent: overallStats?.total_absent || 0,
    pending: overallStats?.remaining_lectures || 0,
    total: overallStats?.total_lectures || 0,
    percentage: overallStats?.overall_attendance_percentage || 0,
  };
  const monthlyTrend = analyticsData?.monthlyTrend || [];
  const dailyTrend = analyticsData?.dailyTrend || [];
  const progression = analyticsData?.progression || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <Card hover={false} className="p-6 border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-[#0b0f19] to-purple-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles size={14} className="text-indigo-400" />
              <span>Chart.js Analytics Suite</span>
            </div>
            <h2 className="font-heading text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>AttendAI Visual Analytics Dashboard</span>
            </h2>
            <p className="text-xs text-gray-300">
              Interactive real-time Chart.js visualizations for subject performance, daily trends, monthly progression, and attendance distribution.
            </p>
          </div>

          <div className="self-start sm:self-auto shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={fetchAnalytics}
              isLoading={loading}
              leftIcon={<RefreshCw size={16} />}
            >
              Refresh Analytics
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid of 5 Charts */}

      {/* 1. Subject-Wise Comparison (Full Width) */}
      <SubjectWiseBarChart subjects={subjectComparison} loading={loading} />

      {/* 2 & 3. Monthly Trend & Distribution (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendLineChart monthlyData={monthlyTrend} loading={loading} />
        <AttendancePieChart distribution={distribution} loading={loading} />
      </div>

      {/* 4 & 5. Progression & Daily Breakdown (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SemesterProgressionChart progressionData={progression} loading={loading} />
        <DailyTrendChart dailyData={dailyTrend} loading={loading} />
      </div>
    </div>
  );
}
