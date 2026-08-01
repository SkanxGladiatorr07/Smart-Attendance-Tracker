import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LoadingFallback from './components/common/LoadingFallback';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ToastProvider } from './context/ToastProvider';
import { AttendanceProvider } from './context/AttendanceContext';
import QuickUndoFloatingBar from './components/productivity/QuickUndoFloatingBar';
import OfflineBanner from './components/common/OfflineBanner';

// Lazy loaded page chunks
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Subjects = lazy(() => import('./pages/Subjects'));
const Attendance = lazy(() => import('./pages/Attendance'));
const History = lazy(() => import('./pages/History'));
const Settings = lazy(() => import('./pages/Settings'));
const SemesterSetup = lazy(() => import('./pages/SemesterSetup'));
const SemesterReview = lazy(() => import('./pages/SemesterReview'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AttendanceProvider>
          <OfflineBanner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
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
            </Suspense>
            <QuickUndoFloatingBar />
          </BrowserRouter>
        </AttendanceProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
