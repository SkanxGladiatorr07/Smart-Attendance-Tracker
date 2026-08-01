import { useMemo, memo } from 'react';
import { Line } from 'react-chartjs-2';
import './chartSetup';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { Target } from 'lucide-react';

function SemesterProgressionChart({ progressionData = [], loading = false }) {
  const chartData = useMemo(() => {
    const labels = progressionData.map((p) => p.label || p.dateKey);
    const rates = progressionData.map((p) => p.cumulativeRate || 0);
    const targetLine = progressionData.map(() => 75);

    return {
      labels,
      datasets: [
        {
          label: 'Cumulative Attendance Rate (%)',
          data: rates,
          borderColor: '#10b981', // Emerald
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');
            return gradient;
          },
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#059669',
          pointBorderColor: '#ffffff',
          pointRadius: 3,
          pointHoverRadius: 6,
        },
        {
          label: 'Target Threshold (75%)',
          data: targetLine,
          borderColor: '#f43f5e', // Rose dashed target line
          borderWidth: 2,
          borderDash: [6, 6],
          pointRadius: 0,
          fill: false,
        },
      ],
    };
  }, [progressionData]);

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
          callbacks: {
            label: (context) => {
              if (context.datasetIndex === 1) return ' Target: 75%';
              const item = progressionData[context.dataIndex];
              return ` Rate: ${context.parsed.y}% (${item?.cumulativePresent || 0}/${item?.cumulativeMarked || 0})`;
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
            },
            maxTicksLimit: 10,
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
  }, [progressionData]);

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
            <Target className="text-purple-400" size={20} />
            <span>Semester Attendance Progression</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Cumulative attendance percentage trajectory relative to the 75% target line.
          </p>
        </div>
      </div>

      {progressionData.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
          No progression trajectory data recorded yet.
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <Line data={chartData} options={options} />
        </div>
      )}
    </Card>
  );
}

export default memo(SemesterProgressionChart);
