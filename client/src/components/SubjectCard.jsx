import { Edit2, Trash2, User, BookOpen } from 'lucide-react';

export default function SubjectCard({ subject, onEdit, onDelete }) {
  const { id, subject_name, faculty_name, color, created_at } = subject;
  const tagColor = color || '#6366f1';

  const formattedDate = created_at
    ? new Date(created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/40 hover:shadow-xl relative flex flex-col justify-between group">
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl transition-all duration-300"
        style={{ backgroundColor: tagColor, boxShadow: `0 2px 10px ${tagColor}40` }}
      />

      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 mb-3 pt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
              style={{ backgroundColor: `${tagColor}25`, color: tagColor, border: `1px solid ${tagColor}40` }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h3 className="font-heading text-lg sm:text-xl font-bold text-white tracking-tight leading-snug group-hover:text-indigo-200 transition-colors">
                {subject_name}
              </h3>
              {formattedDate && (
                <span className="text-xs text-gray-500 block mt-0.5">Added {formattedDate}</span>
              )}
            </div>
          </div>

          {/* Color Indicator Badge */}
          <div
            className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-1"
            style={{ backgroundColor: tagColor, boxShadow: `0 0 8px ${tagColor}` }}
            title={`Color code: ${tagColor}`}
          />
        </div>

        {/* Faculty info */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2 text-sm text-gray-300">
          <User size={16} className="text-indigo-400 shrink-0" />
          <span className="truncate">
            {faculty_name ? (
              <span><span className="text-gray-400">Faculty:</span> {faculty_name}</span>
            ) : (
              <span className="italic text-gray-500">No faculty assigned</span>
            )}
          </span>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(subject)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/5 text-gray-300 hover:text-white hover:bg-indigo-600/30 hover:border-indigo-500/40 border border-transparent transition-all"
          title="Edit Subject"
        >
          <Edit2 size={14} />
          <span>Edit</span>
        </button>

        <button
          onClick={() => onDelete(id, subject_name)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/40 border border-transparent transition-all"
          title="Delete Subject"
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
