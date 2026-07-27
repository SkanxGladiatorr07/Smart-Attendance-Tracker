import { History as HistoryIcon, Calendar } from 'lucide-react';

export default function History() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-6 border-b border-white/10">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <HistoryIcon className="text-purple-400" size={28} />
          <span>Attendance History & Logs</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Review historical attendance logs, date filters, and export analytics.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto border-white/10 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mx-auto flex items-center justify-center">
          <Calendar size={32} />
        </div>

        <h2 className="font-heading text-xl font-bold text-white">Historical Logs & Analytics</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          Historical attendance records and date filtering will appear here once attendance sessions are recorded.
        </p>

        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            History Log Ready
          </span>
        </div>
      </div>
    </div>
  );
}
