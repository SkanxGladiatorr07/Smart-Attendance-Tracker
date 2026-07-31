import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Settings from './pages/Settings';
import SemesterSetup from './pages/SemesterSetup';
import SemesterReview from './pages/SemesterReview';
import NotFound from './pages/NotFound';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './context/ToastProvider';
import { AttendanceProvider } from './context/AttendanceContext';

import QuickUndoFloatingBar from './components/productivity/QuickUndoFloatingBar';

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AttendanceProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="subjects" element={<Subjects />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="history" element={<History />} />
                <Route path="settings" element={<Settings />} />
                <Route path="semester-setup" element={<SemesterSetup />} />
                <Route path="semester-review" element={<SemesterReview />} />
                {/* 404 Catch-all route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
            <QuickUndoFloatingBar />
          </BrowserRouter>
        </AttendanceProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
