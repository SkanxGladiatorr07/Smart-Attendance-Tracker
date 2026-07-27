import { Edit2, Trash2, User, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardFooter } from '../common/Card';
import Button from '../common/Button';

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
    <Card className="relative flex flex-col justify-between group">
      {/* Top Accent Line */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl transition-all duration-300"
        style={{ backgroundColor: tagColor, boxShadow: `0 2px 10px ${tagColor}40` }}
      />

      <div>
        {/* Card Header */}
        <CardHeader className="pt-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold"
              style={{ backgroundColor: `${tagColor}25`, color: tagColor, border: `1px solid ${tagColor}40` }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <CardTitle className="group-hover:text-indigo-200 transition-colors">
                {subject_name}
              </CardTitle>
              {formattedDate && (
                <span className="text-xs text-gray-500 block mt-0.5">Added {formattedDate}</span>
              )}
            </div>
          </div>

          <div
            className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-1"
            style={{ backgroundColor: tagColor, boxShadow: `0 0 8px ${tagColor}` }}
            title={`Color code: ${tagColor}`}
          />
        </CardHeader>

        {/* Faculty info */}
        <div className="flex items-center gap-2 text-sm text-gray-300">
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
      <CardFooter>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(subject)}
          leftIcon={<Edit2 size={14} />}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(id, subject_name)}
          leftIcon={<Trash2 size={14} />}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}
