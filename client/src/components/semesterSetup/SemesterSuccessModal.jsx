import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  Sparkles, 
  LayoutDashboard, 
  UserCheck, 
  BookOpen, 
  Calendar, 
  Clock, 
  Layers,
  ArrowRight
} from 'lucide-react';

export default function SemesterSuccessModal({
  isOpen,
  onClose,
  stats,
  calendarDates
}) {
  const navigate = useNavigate();
  if (!isOpen) return null;

  const totalLectures = stats?.totalLectures || 0;
  const workingDays = stats?.workingDays || 0;
  const subjectsCount = stats?.subjects || 0;
  const lecturesPerSubject = stats?.lecturesPerSubject || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div 
        className="bg-[#131827] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background blur */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-6 md:p-8 space-y-6 text-center">
          {/* Animated Celebration Badge */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-2xl shadow-emerald-500/30 animate-bounce-short">
            <div className="w-full h-full bg-[#131827] rounded-[22px] flex items-center justify-center text-emerald-400">
              <CheckCircle2 size={42} className="text-emerald-400" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400 mb-2">
              <Sparkles size={14} />
              <span>Generation Successful</span>
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white tracking-tight">
              Semester Schedule Activated!
            </h2>
            <p className="text-gray-300 text-xs md:text-sm mt-1 max-w-md mx-auto">
              Your academic calendar & weekly timetable have been converted into active daily lecture schedules.
            </p>
          </div>

          {/* Key Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[11px] text-gray-400 font-medium">Working Days</div>
              <div className="text-lg font-bold text-white mt-0.5">{workingDays} Days</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[11px] text-gray-400 font-medium">Total Lectures</div>
              <div className="text-lg font-bold text-indigo-400 mt-0.5">{totalLectures} Classes</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[11px] text-gray-400 font-medium">Subjects</div>
              <div className="text-lg font-bold text-purple-400 mt-0.5">{subjectsCount} Courses</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div className="text-[11px] text-gray-400 font-medium">Initial Status</div>
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block mt-1">
                Pending
              </div>
            </div>
          </div>

          {/* Per-Subject Lecture Breakdown */}
          {Object.keys(lecturesPerSubject).length > 0 && (
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 text-left space-y-2.5">
              <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
                <span>Subject Lecture Breakdown</span>
                <span>Lectures</span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {Object.entries(lecturesPerSubject).map(([subject, count]) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.03] text-xs"
                  >
                    <span className="font-semibold text-white truncate max-w-[240px]">{subject}</span>
                    <span className="font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {count} lectures
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Quick Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <button
              onClick={() => {
                onClose();
                navigate('/');
              }}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30"
            >
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/attendance');
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck size={16} />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => {
                onClose();
                navigate('/subjects');
              }}
              className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen size={16} />
              <span>View Subjects</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
