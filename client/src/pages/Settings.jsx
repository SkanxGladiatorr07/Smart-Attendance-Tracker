import HealthStatus from '../components/layout/HealthStatus';
import PwaNotificationSettings from '../components/settings/PwaNotificationSettings';
import BackupRestoreCard from '../components/settings/BackupRestoreCard';
import { Settings as SettingsIcon, Database, Smartphone, ShieldCheck } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="pb-6 border-b border-white/10">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          <SettingsIcon className="text-indigo-400" size={28} />
          <span>Application Settings, Backup & Notifications</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Database backup & restore, PWA notification preferences, system diagnostics, and database telemetry.
        </p>
      </div>

      {/* Backup & Restore System */}
      <BackupRestoreCard />

      {/* PWA Notification Manager */}
      <PwaNotificationSettings />

      {/* Backend Health Diagnostics */}
      <div className="space-y-4">
        <h2 className="font-heading text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="text-emerald-400" size={22} />
          <span>Backend & Database Telemetry</span>
        </h2>
        <HealthStatus />
      </div>

      {/* PWA & System Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-indigo-400">
            <Database size={22} />
            <h3 className="font-heading text-lg font-bold text-white">MySQL Database</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            Connected using <code className="text-indigo-300 font-mono">mysql2/promise</code> connection pool on default port 3306.
          </p>
          <div className="pt-2 text-xs text-gray-500 font-mono">
            Database: attendai_db | Driver: MySQL2
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3 text-purple-400">
            <Smartphone size={22} />
            <h3 className="font-heading text-lg font-bold text-white">Progressive Web App (PWA)</h3>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            App Shell offline caching enabled with Service Worker registration and Web App Manifest.
          </p>
          <div className="pt-2 text-xs text-gray-500 font-mono">
            Display: Standalone | Theme: #0b0f19
          </div>
        </div>
      </div>
    </div>
  );
}
