import { useState } from 'react';
import SubjectManagement from './pages/SubjectManagement';
import HealthStatus from './components/HealthStatus';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import { Cpu, BookOpen, Activity } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('subjects');

  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="logo-wrapper">
            <div className="logo-icon">
              <Cpu size={24} color="#ffffff" />
            </div>
            <span className="logo-text">AttendAI</span>
          </div>

          {/* PWA Install Button */}
          <PwaInstallPrompt />
        </div>

        {/* View Switcher Tabs */}
        <nav className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('subjects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'subjects'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BookOpen size={16} />
            <span>Subjects</span>
          </button>

          <button
            onClick={() => setActiveTab('health')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === 'health'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Activity size={16} />
            <span>System Health</span>
          </button>
        </nav>
      </header>

      {/* Main Content Body */}
      <main className="flex-1">
        {activeTab === 'subjects' && <SubjectManagement />}
        {activeTab === 'health' && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Backend Diagnostics</h2>
              <p className="text-gray-400 text-sm">Real-time health telemetry & connection status with Express backend.</p>
            </div>
            <HealthStatus />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} AttendAI. Progressive Web App (PWA) Enabled.</p>
      </footer>
    </div>
  );
}
