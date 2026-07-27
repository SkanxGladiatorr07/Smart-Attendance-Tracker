import { UserCheck, Clock } from 'lucide-react';

export default function Attendance() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="pb-6 border-b border-white/10">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <UserCheck className="text-emerald-400" size={28} />
          <span>Mark Attendance</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Real-time attendance marking engine and automated face identification module.
        </p>
      </div>

      <div className="glass-card rounded-3xl p-12 text-center max-w-xl mx-auto border-white/10 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
          <Clock size={32} />
        </div>

        <h2 className="font-heading text-xl font-bold text-white">Attendance Tracking Module</h2>
        <p className="text-gray-400 text-sm leading-relaxed">
          The automated attendance logging module is ready for subject integration. Configure your subjects in the Subjects tab before launching attendance sessions.
        </p>

        <div className="pt-2">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Module Shell Active
          </span>
        </div>
      </div>
    </div>
  );
}
