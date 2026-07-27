import HealthStatus from './components/HealthStatus';
import { Cpu } from 'lucide-react';

export default function App() {
  return (
    <div className="app-container">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="logo-wrapper">
          <div className="logo-icon">
            <Cpu size={24} color="#ffffff" />
          </div>
          <span className="logo-text">AttendAI</span>
        </div>
        <div className="badge-tag">Full-Stack Scaffolding v1.0</div>
      </header>

      {/* Main Hero Section */}
      <main>
        <section className="hero">
          <h1 className="hero-title">AI-Powered Attendance Tracker</h1>
          <p className="hero-subtitle">
            Next-generation automated attendance monitoring platform. Scalable micro-architecture with real-time health telemetry.
          </p>
        </section>

        {/* Health Diagnostic Component */}
        <HealthStatus />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} AttendAI. Built with React, Vite & Express.</p>
      </footer>
    </div>
  );
}
