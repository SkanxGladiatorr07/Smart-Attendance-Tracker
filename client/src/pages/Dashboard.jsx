import { Link } from 'react-router-dom';
import { BookOpen, UserCheck, ShieldCheck, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 relative overflow-hidden border-indigo-500/20 bg-gradient-to-r from-indigo-900/30 via-[#0b0f19] to-purple-900/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles size={14} />
            <span>AI-Powered Attendance Engine</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to AttendAI
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Real-time automated attendance tracking platform. Manage subjects, faculty members, and monitor attendance metrics seamlessly.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/subjects"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <span>Manage Subjects</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/attendance"
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-sm border border-white/10 flex items-center gap-2 transition-all"
            >
              <UserCheck size={16} />
              <span>Mark Attendance</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Total Subjects</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-white">Active</div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Configured</span> in MySQL database
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Attendance Session</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-white">Ready</div>
          <div className="text-xs text-gray-400">No active session running</div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">Average Rate</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-white">-- %</div>
          <div className="text-xs text-gray-400">Telemetry tracking pending</div>
        </div>

        <div className="glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider text-gray-400">System Telemetry</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold font-heading text-emerald-400">Healthy</div>
          <div className="text-xs text-gray-400">Backend API endpoint online</div>
        </div>
      </div>
    </div>
  );
}
