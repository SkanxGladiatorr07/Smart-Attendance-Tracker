import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Card } from './Card';
import Button from './Button';

export default function ErrorStateCard({
  title = 'An Error Occurred',
  message = 'Failed to load requested data. Please check your network connection.',
  onRetry,
  isRetrying = false,
  className = '',
}) {
  return (
    <Card hover={false} className={`p-6 border-rose-500/30 bg-rose-950/20 space-y-4 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle size={22} />
        </div>

        <div className="space-y-1 flex-1">
          <h3 className="font-heading font-bold text-white text-base sm:text-lg">{title}</h3>
          <p className="text-xs text-rose-200 leading-relaxed">{message}</p>
        </div>
      </div>

      {onRetry && (
        <div className="pt-2 border-t border-rose-500/20 flex justify-end">
          <Button
            variant="danger"
            size="sm"
            onClick={onRetry}
            isLoading={isRetrying}
            leftIcon={<RotateCcw size={14} />}
          >
            Try Again
          </Button>
        </div>
      )}
    </Card>
  );
}
