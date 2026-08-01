import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black text-xs font-bold py-2 px-4 flex items-center justify-center gap-2 shadow-lg animate-fadeIn">
      <WifiOff size={16} className="shrink-0 animate-pulse" />
      <span>You are currently offline. AttendAI is operating in offline mode. Changes will sync when connectivity is restored.</span>
    </div>
  );
}
