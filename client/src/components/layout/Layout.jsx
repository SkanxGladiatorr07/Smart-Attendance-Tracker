import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-gray-100 flex flex-col">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
