import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Attendance from './pages/Attendance';
import History from './pages/History';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="subjects" element={<Subjects />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
          {/* Fallback route */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
