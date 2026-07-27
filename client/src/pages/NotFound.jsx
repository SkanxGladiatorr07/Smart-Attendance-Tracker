import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card max-w-lg w-full p-8 sm:p-10 rounded-3xl text-center space-y-6 border-white/10">
        {/* 404 Graphic Badge */}
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center shadow-2xl shadow-indigo-500/20">
            <Compass size={40} className="animate-spin-slow" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-heading font-bold text-xs">
            404
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-extrabold text-white">Page Not Found</h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            The page route you requested does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" size="md" leftIcon={<Home size={16} />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
