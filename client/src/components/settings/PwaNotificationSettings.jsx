import { useState, useEffect } from 'react';
import {
  Bell,
  BellOff,
  Sun,
  Moon,
  Send,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { Card } from '../common/Card';
import Button from '../common/Button';
import { pwaNotificationService } from '../../services/pwaNotificationService';
import { useAttendance } from '../../context/AttendanceContext';
import { useToast } from '../../hooks/useToast';

export default function PwaNotificationSettings() {
  const { showToast } = useToast();
  const { todaySchedule } = useAttendance();

  const [isSupported, setIsSupported] = useState(true);
  const [permission, setPermission] = useState('default');
  const [enabled, setEnabled] = useState(true);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const supported = pwaNotificationService.isSupported();
    setIsSupported(supported);
    if (supported) {
      setPermission(pwaNotificationService.getPermissionStatus());
      setEnabled(pwaNotificationService.isNotificationsEnabled());
    }
  }, []);

  const handleToggle = async () => {
    if (!isSupported) {
      showToast('Notifications are not supported in this browser.', 'error');
      return;
    }

    if (!enabled && permission !== 'granted') {
      const perm = await pwaNotificationService.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        showToast('Browser notification permission was denied.', 'error');
        return;
      }
    }

    const nextState = !enabled;
    setEnabled(nextState);
    pwaNotificationService.setNotificationsEnabled(nextState);
    showToast(
      nextState ? 'PWA notifications enabled!' : 'PWA notifications disabled.',
      nextState ? 'success' : 'info'
    );
  };

  const handleRequestPermission = async () => {
    const perm = await pwaNotificationService.requestPermission();
    setPermission(perm);
    if (perm === 'granted') {
      setEnabled(true);
      showToast('Notification permission granted!', 'success');
    } else {
      showToast('Notification permission was denied by browser settings.', 'error');
    }
  };

  const handleSendTest = async () => {
    if (permission !== 'granted') {
      const perm = await pwaNotificationService.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        showToast('Please grant notification permissions first.', 'error');
        return;
      }
    }

    setTesting(true);
    try {
      const success = await pwaNotificationService.sendTestNotification(todaySchedule);
      if (success) {
        showToast('Test PWA notification sent successfully!', 'success');
      } else {
        showToast('Failed to deliver test notification. Check browser settings.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error triggering test notification.', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerMorning = async () => {
    setTesting(true);
    try {
      const success = await pwaNotificationService.triggerMorningReminder(todaySchedule);
      if (success) {
        showToast('Morning Brief notification triggered!', 'success');
      } else {
        showToast('Failed to trigger morning reminder.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerEvening = async () => {
    setTesting(true);
    try {
      const success = await pwaNotificationService.triggerEveningReminder(todaySchedule);
      if (success) {
        showToast('Evening Check notification triggered!', 'success');
      } else {
        showToast('Failed to trigger evening reminder.', 'error');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTesting(false);
    }
  };

  const lectureCount = (todaySchedule?.lectures || []).length;

  return (
    <Card hover={false} className="p-6 space-y-6 border-indigo-500/20 bg-gradient-to-br from-[#0b0f19] via-[#111827] to-[#1e1b4b]/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Smartphone size={14} className="text-indigo-400" />
            <span>PWA Notification Manager</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Progressive Web App Notifications</span>
          </h2>
          <p className="text-xs text-gray-300">
            Configure automated morning briefs, evening attendance checks, and test PWA local reminders.
          </p>
        </div>

        {/* Enable / Disable Master Toggle Switch */}
        <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
          <span className="text-xs font-bold text-gray-300">
            {enabled ? 'Notifications Active' : 'Notifications Disabled'}
          </span>
          <button
            type="button"
            onClick={handleToggle}
            className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
              enabled ? 'bg-indigo-600' : 'bg-gray-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Permission Warning / Status Callout */}
      {!isSupported ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <span>Notifications API is not supported in your current browser environment.</span>
        </div>
      ) : permission === 'denied' ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold text-rose-400">
            <ShieldAlert size={18} />
            <span>Browser Permission Blocked</span>
          </div>
          <p className="text-gray-300">
            Notifications are currently blocked by browser permissions. To enable PWA notifications, click the lock icon in your browser address bar and set Notifications to "Allow".
          </p>
        </div>
      ) : permission === 'default' ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-amber-400 shrink-0" />
            <span>Browser permission required to deliver local PWA notifications.</span>
          </div>
          <Button variant="primary" size="sm" onClick={handleRequestPermission}>
            Grant Permission
          </Button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold">
            <ShieldCheck size={18} className="text-emerald-400" />
            <span>Browser Permission Granted & Active</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">Permission: Granted</span>
        </div>
      )}

      {/* Automated Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Brief Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sun size={18} />
              <span>Morning Attendance Brief</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              7:00 AM - 12:00 PM
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Delivers a daily morning reminder featuring today's scheduled lecture count (<strong>{lectureCount} lectures today</strong>) and AI attendance recommendations.
          </p>
          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTriggerMorning}
              isLoading={testing}
              leftIcon={<Send size={14} />}
            >
              Test Morning Brief
            </Button>
          </div>
        </div>

        {/* Evening Check Card */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
              <Moon size={18} />
              <span>Evening Attendance Check</span>
            </div>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
              5:00 PM - 10:00 PM
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed">
            Delivers an evening prompt checking if today's <strong>{lectureCount} lectures</strong> have been marked as Present or Absent.
          </p>
          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleTriggerEvening}
              isLoading={testing}
              leftIcon={<Send size={14} />}
            >
              Test Evening Check
            </Button>
          </div>
        </div>
      </div>

      {/* Manual Test Action */}
      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-gray-400">
          Works 100% locally on standalone installed PWA and web browsers without server push setup.
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleSendTest}
          isLoading={testing}
          leftIcon={<Sparkles size={16} />}
        >
          Send Test Notification
        </Button>
      </div>
    </Card>
  );
}
