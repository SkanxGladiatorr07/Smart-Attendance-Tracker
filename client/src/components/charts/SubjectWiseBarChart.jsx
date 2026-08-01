import { useMemo, memo } from 'react';
import { Bar } from 'react-chartjs-2';
import './chartSetup';
import { Card } from '../common/Card';
import Skeleton from '../common/Skeleton';
import { BarChart2 } from 'lucide-react';

function SubjectWiseBarChart({ subjects = [], loading = false }) {
  const chartData = useMemo(() => {
    const labels = subjects.map((s) => s.subject_name || 'Subject');
    const percentages = subjects.map((s) => s.attendance_percentage || 0);
    const backgroundColors = subjects.map((s) => {
      const pct = s.attendance_percentage || 0;
      if (pct >= 85) return '#10b981'; // Emerald
      if (pct >= 75) return '#f59e0b'; // Amber
      return '#f43f5e'; // Rose
    });

    return {
      labels,
      datasets: [
        {
          label: 'Attendance Rate (%)',
          data: percentages,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors,
          borderWidth: 1.5,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 24,
          maxBarThickness: 36,
        },
      ],
    };
  }, [subjects]);

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
          display: false,
        },
        tooltip: {
          backgroundColor: '#0f172a',
          titleColor: '#f8fafc',
          bodyColor: '#e2e8f0',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          callbacks: {
            label: (context) => {
              const sub = subjects[context.dataIndex];
              const present = sub?.present || 0;
              const total = sub?.total_lectures || 0;
              return ` ${context.parsed.y}% (${present}/${total} attended)`;
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
  }, [subjects]);

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
            <BarChart2 className="text-indigo-400" size={20} />
            <span>Subject-Wise Attendance Comparison</span>
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Comparative attendance rates per subject with 75% target threshold highlighting.
          </p>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="h-60 flex items-center justify-center text-xs text-gray-500 italic border border-dashed border-white/10 rounded-2xl">
          No subject data available.
        </div>
      ) : (
        <div className="h-64 sm:h-72 w-full pt-2">
          <Bar data={chartData} options={options} />
        </div>
      )}
    </Card>
  );
}

export default memo(SubjectWiseBarChart);
