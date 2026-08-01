import { useMemo, memo } from 'react';
import { Bar } from 'react-chartjs-2';
import './chartSetup';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { Calendar } from 'lucide-react';

function DailyTrendChart({ dailyData = [], loading = false }) {
  const chartData = useMemo(() => {
    const labels = dailyData.map((d) => d.date_label || d.date_key);
    const presentData = dailyData.map((d) => Number(d.present) || 0);
    const absentData = dailyData.map((d) => Number(d.absent) || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Present',
          data: presentData,
          backgroundColor: '#10b981', // Emerald
          borderRadius: 6,
          borderSkipped: false,
        },
        {
          label: 'Absent',
          data: absentData,
          backgroundColor: '#f43f5e', // Rose
          borderRadius: 6,
          borderSkipped: false,
        },
      ],
    };
  }, [dailyData]);

  const options = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      normalized: true,
      animation: {
        duration: 350,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            color: '#cbd5e1',
            font: {
              size: 11,
              weight: '600',
            },
            boxWidth: 12,
            boxHeight: 12,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
            drawBorder: false,
          },
          ticks: {
            color: '#94a3b8',
            font: {
              size: 11,
            },
            maxTicksLimit: 12,
          },
        },
        y: {
          stacked: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.05)',
            drawBorder: false,
          },
          ticks: {
            color: '#94a3b8',
            stepSize: 1,
            precision: 0,
          },
        },
      },
    };
  }, []);

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
            <Calendar className="text-amber-400" size={20} />
            <span>Daily Attendance Breakdown</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Day-by-day stack of attended (Present) vs missed (Absent) lectures.
          </p>
        </div>
      </div>

      {dailyData.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
          No daily attendance records found.
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </Card>
  );
}

export default memo(DailyTrendChart);
