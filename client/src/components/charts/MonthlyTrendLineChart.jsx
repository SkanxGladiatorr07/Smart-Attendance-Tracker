import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { TrendingUp } from 'lucide-react';

export default function MonthlyTrendLineChart({ monthlyData = [], loading = false }) {
  const chartData = useMemo(() => {
    const labels = monthlyData.map((m) => m.label || m.monthKey);
    const percentages = monthlyData.map((m) => m.percentage || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Monthly Attendance Rate (%)',
          data: percentages,
          borderColor: '#818cf8', // Indigo
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(129, 140, 248, 0.4)');
            gradient.addColorStop(1, 'rgba(129, 140, 248, 0.0)');
            return gradient;
          },
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7,
        },
      ],
    };
  }, [monthlyData]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
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
              const item = monthlyData[context.dataIndex];
              return ` ${context.parsed.y}% (${item?.present || 0} Present / ${item?.absent || 0} Absent)`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 11,
              weight: '600',
            },
          },
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#94a3b8',
            stepSize: 25,
            callback: (val) => `${val}%`,
          },
        },
      },
    };
  }, [monthlyData]);

  if (loading) {
    return (
      <Card hover={false} className="p-6 space-y-4">
        <Skeleton height={20} width="50%" />
        <Skeleton height={240} className="rounded-2xl" />
      </Card>
    );
  }

  return (
    <Card hover={false} className="p-6 space-y-4 border-white/10 bg-[#0d121f]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="text-indigo-400" size={20} />
            <span>Monthly Attendance Trend</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Month-by-month attendance percentage progression over the semester.
          </p>
        </div>
      </div>

      {monthlyData.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
          No monthly trend data recorded yet.
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <Line data={chartData} options={options} />
        </div>
      )}
    </Card>
  );
}
