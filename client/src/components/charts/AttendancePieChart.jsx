import { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import './chartSetup';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { PieChart } from 'lucide-react';

export default function AttendancePieChart({ distribution = {}, loading = false }) {
  const { present = 0, absent = 0, pending = 0, total = 0 } = distribution;

  const chartData = useMemo(() => {
    return {
      labels: ['Present', 'Absent', 'Pending'],
      datasets: [
        {
          data: [present, absent, pending],
          backgroundColor: ['#10b981', '#f43f5e', '#f59e0b'], // Emerald, Rose, Amber
          borderColor: ['#047857', '#be123c', '#b45309'],
          borderWidth: 2,
          hoverOffset: 6,
        },
      ],
    };
  }, [present, absent, pending]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#cbd5e1',
            font: {
              size: 12,
              weight: '600',
            },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle',
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              const val = context.parsed;
              const pct = total > 0 ? Math.round((val / total) * 100 * 10) / 10 : 0;
              return ` ${context.label}: ${val} lectures (${pct}%)`;
            },
          },
        },
      },
    };
  }, [total]);

  if (loading) {
    return (
      <Card hover={false} className="p-6 space-y-4">
        <Skeleton height={20} width="50%" />
        <Skeleton height={240} className="rounded-2xl" />
      </Card>
    );
  }

  const overallRate = total > 0 && (present + absent) > 0
    ? Math.round((present / (present + absent)) * 100 * 10) / 10
    : 0;

  return (
    <Card hover={false} className="p-6 space-y-4 border-white/10 bg-[#0d121f]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <PieChart className="text-emerald-400" size={20} />
            <span>Present vs Absent Distribution</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Overall breakdown of attended, missed, and pending scheduled lectures.
          </p>
        </div>
      </div>

      {total === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
          No lecture attendance data recorded yet.
        </div>
      ) : (
        <div className="relative h-64 sm:h-72 w-full flex items-center justify-center pt-2">
          <Doughnut data={chartData} options={options} />
          {/* Center Metric Callout */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-9 text-center pointer-events-none">
            <span className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              {overallRate}%
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-wider text-emerald-400">
              Attendance Rate
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
