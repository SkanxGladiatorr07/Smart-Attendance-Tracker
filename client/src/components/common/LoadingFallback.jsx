import { Sparkles } from 'lucide-react';

export default function LoadingFallback() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 p-8 animate-fadeIn">
      <div className="relative">
        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-spin">
          <Sparkles size={28} />
        </div>
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-heading text-base font-bold text-white tracking-wide">
          Loading Page Module...
        </h3>
        <p className="text-xs text-gray-400">
          AttendAI Smart Attendance Tracker
        </p>
      </div>
    </div>
  );
}
