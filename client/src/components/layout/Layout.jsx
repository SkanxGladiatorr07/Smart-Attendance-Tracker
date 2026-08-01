import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import { useSwipe } from '../../hooks/useSwipe';

const ROUTE_ORDER = ['/', '/semester-setup', '/subjects', '/attendance', '/history', '/settings'];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Enable touch swipe navigation between pages on mobile
  useSwipe({
    onSwipeLeft: () => {
      const idx = ROUTE_ORDER.indexOf(location.pathname);
      if (idx !== -1 && idx < ROUTE_ORDER.length - 1) {
        navigate(ROUTE_ORDER[idx + 1]);
      }
    },
    onSwipeRight: () => {
      const idx = ROUTE_ORDER.indexOf(location.pathname);
      if (idx > 0) {
        navigate(ROUTE_ORDER[idx - 1]);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 pb-28 md:pb-8 max-w-7xl">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
