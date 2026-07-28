import { BarChart3, TrendingUp, PieChart, Sparkles } from 'lucide-react';
import { Card } from '../common/Card';

export default function ChartPlaceholder({
  title = 'Attendance Visualization',
  subtitle = 'Analytics and trends powered by Chart.js',
  type = 'line',
}) {
  return (
    <Card hover={false} className="p-6 space-y-4 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            {type === 'line' && <TrendingUp size={18} className="text-indigo-400" />}
            {type === 'bar' && <BarChart3 size={18} className="text-purple-400" />}
            {type === 'doughnut' && <PieChart size={18} className="text-emerald-400" />}
            <h3 className="font-heading text-lg font-bold text-white tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold shrink-0">
          <Sparkles size={13} className="text-indigo-400" />
          <span>Chart.js Ready</span>
        </span>
      </div>

      {/* Mock SVG Chart Area representing Chart.js Canvas */}
      <div className="relative w-full h-48 sm:h-56 rounded-2xl bg-white/[0.02] border border-white/5 p-4 flex flex-col justify-between overflow-hidden">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
          <div className="border-b border-dashed border-gray-400 w-full" />
          <div className="border-b border-dashed border-gray-400 w-full" />
          <div className="border-b border-dashed border-gray-400 w-full" />
          <div className="border-b border-dashed border-gray-400 w-full" />
        </div>

        {/* Render SVG depending on chart type */}
        {type === 'line' ? (
          <div className="relative z-10 w-full h-full flex flex-col justify-end">
            <svg
              className="w-full h-36 overflow-visible"
              viewBox="0 0 400 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area Fill */}
              <path
                d="M 0,90 Q 60,40 120,70 T 240,30 T 360,50 L 400,20 L 400,120 L 0,120 Z"
                fill="url(#chartGradient)"
              />

              {/* Trend Line */}
              <path
                d="M 0,90 Q 60,40 120,70 T 240,30 T 360,50 L 400,20"
                fill="none"
                stroke="#818cf8"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="0" cy="90" r="4" fill="#a5b4fc" />
              <circle cx="80" cy="50" r="4" fill="#a5b4fc" />
              <circle cx="160" cy="65" r="4" fill="#a5b4fc" />
              <circle cx="240" cy="30" r="5" fill="#38bdf8" />
              <circle cx="320" cy="55" r="4" fill="#a5b4fc" />
              <circle cx="400" cy="20" r="5" fill="#34d399" />
            </svg>

            <div className="flex justify-between text-[11px] text-gray-500 pt-2 border-t border-white/5">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 w-full h-full flex flex-col justify-end">
            {/* Bar Chart Mockup */}
            <div className="w-full h-36 flex items-end justify-between gap-3 px-2">
              {[
                { height: '70%', color: 'bg-indigo-500', label: 'Sub 1' },
                { height: '90%', color: 'bg-emerald-500', label: 'Sub 2' },
                { height: '60%', color: 'bg-amber-500', label: 'Sub 3' },
                { height: '85%', color: 'bg-indigo-400', label: 'Sub 4' },
                { height: '45%', color: 'bg-rose-500', label: 'Sub 5' },
              ].map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <div
                    className={`w-full max-w-[36px] ${bar.color} rounded-t-xl opacity-80 hover:opacity-100 transition-all duration-300 shadow-lg`}
                    style={{ height: bar.height }}
                  />
                  <span className="text-[10px] text-gray-400">{bar.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
