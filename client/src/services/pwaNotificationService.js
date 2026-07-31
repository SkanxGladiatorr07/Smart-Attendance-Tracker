/**
 * PWA Notification Service - Clean, browser-permission respecting, local PWA Notification Manager
 * Handles Morning reminders, Evening reminders, test notifications, and permission management.
 */

const STORAGE_KEYS = {
  ENABLED: 'attendai_notifications_enabled',
  MORNING_TIME: 'attendai_morning_time',
  EVENING_TIME: 'attendai_evening_time',
  LAST_MORNING: 'attendai_last_morning_sent',
  LAST_EVENING: 'attendai_last_evening_sent',
};

export const pwaNotificationService = {
  /**
   * Check if Notifications API is supported in browser/PWA environment
   * @returns {boolean}
   */
  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  },

  /**
   * Get current browser notification permission status ('granted'|'denied'|'default')
   * @returns {string}
   */
  getPermissionStatus() {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  },

  /**
   * Request browser notification permission
   * @returns {Promise<string>} Updated permission status
   */
  async requestPermission() {
    if (!this.isSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.setNotificationsEnabled(true);
      }
      return permission;
    } catch (err) {
      console.warn('Failed to request notification permission:', err);
      return 'denied';
    }
  },

  /**
   * Check if user enabled notifications in application settings
   * @returns {boolean}
   */
  isNotificationsEnabled() {
    if (!this.isSupported()) return false;
    const val = localStorage.getItem(STORAGE_KEYS.ENABLED);
    if (val === null) return this.getPermissionStatus() === 'granted';
    return val === 'true';
  },

  /**
   * Enable or disable application notifications
   * @param {boolean} enabled 
   */
  setNotificationsEnabled(enabled) {
    localStorage.setItem(STORAGE_KEYS.ENABLED, enabled ? 'true' : 'false');
  },

  /**
   * Send local PWA notification via Service Worker or Web Notifications API
   * @param {string} title Notification Title
   * @param {Object} options Notification Options (body, icon, badge, tag, data)
   * @returns {Promise<boolean>} Success boolean
   */
  async showNotification(title, options = {}) {
    if (!this.isSupported() || !this.isNotificationsEnabled()) {
      return false;
    }

    if (Notification.permission !== 'granted') {
      const perm = await this.requestPermission();
      if (perm !== 'granted') return false;
    }

    const defaultOptions = {
      icon: '/pwa-192x192.svg',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      tag: options.tag || 'attendai-pwa-notification',
      renotify: true,
      ...options,
    };

    try {
      // 1. Try Service Worker Notification (Native PWA Installed Mode)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, defaultOptions);
          return true;
        }
      }
    } catch (swErr) {
      console.warn('Service Worker notification failed, falling back to Web Notification:', swErr);
    }

    // 2. Fallback to standard Web Notification
    try {
      new Notification(title, defaultOptions);
      return true;
    } catch (webErr) {
      console.warn('Web Notification fallback failed:', webErr);
      return false;
    }
  },

  /**
   * Dispatch Morning Reminder with today's lecture count
   * @param {Object} todaySchedule Today's schedule object from context/API
   */
  async triggerMorningReminder(todaySchedule = {}) {
    const lectures = todaySchedule.lectures || [];
    const count = lectures.length;
    const isWorkingDay = todaySchedule.isWorkingDay !== false;

    if (!isWorkingDay) return false;

    const title = '🌅 Morning Attendance Brief';
    const body = count > 0
      ? `Good morning! You have ${count} lecture(s) scheduled for today. Check your AttendAI recommendations!`
      : `Good morning! No lectures scheduled for today. Enjoy your day!`;

    return this.showNotification(title, {
      body,
      tag: 'morning-reminder',
      data: { url: '/attendance' },
    });
  },

  /**
   * Dispatch Evening Reminder with today's lecture count & status check
   * @param {Object} todaySchedule Today's schedule object from context/API
   */
  async triggerEveningReminder(todaySchedule = {}) {
    const lectures = todaySchedule.lectures || [];
    const count = lectures.length;
    const pendingCount = lectures.filter((l) => l.attendance_status === 'pending').length;
    const isWorkingDay = todaySchedule.isWorkingDay !== false;

    if (!isWorkingDay || count === 0) return false;

    const title = '🌆 Evening Attendance Check';
    const body = pendingCount > 0
      ? `You had ${count} lecture(s) today. You have ${pendingCount} pending lecture(s) to mark!`
      : `Great job! All ${count} lecture(s) for today have been updated in AttendAI.`;

    return this.showNotification(title, {
      body,
      tag: 'evening-reminder',
      data: { url: '/attendance' },
    });
  },

  /**
   * Dispatch Test Notification to verify PWA notification delivery
   * @param {Object} todaySchedule 
   */
  async sendTestNotification(todaySchedule = {}) {
    const count = (todaySchedule.lectures || []).length;
    const title = '🔔 AttendAI PWA Notification Active';
    const body = `PWA Notifications are working! You have ${count} lecture(s) scheduled today.`;

    return this.showNotification(title, {
      body,
      tag: 'test-notification',
      data: { url: '/' },
    });
  },

  /**
   * Check time and auto-trigger scheduled morning/evening reminders once per day
   * @param {Object} todaySchedule 
   */
  checkAndTriggerAutomatedReminders(todaySchedule = {}) {
    if (!this.isSupported() || !this.isNotificationsEnabled()) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    const lastMorning = localStorage.getItem(STORAGE_KEYS.LAST_MORNING);
    const lastEvening = localStorage.getItem(STORAGE_KEYS.LAST_EVENING);

    // Morning Reminder (Trigger between 7 AM and 12 PM)
    if (currentHour >= 7 && currentHour < 12 && lastMorning !== todayStr) {
      this.triggerMorningReminder(todaySchedule).then((success) => {
        if (success) localStorage.setItem(STORAGE_KEYS.LAST_MORNING, todayStr);
      });
    }

    // Evening Reminder (Trigger between 5 PM and 10 PM)
    if (currentHour >= 17 && currentHour < 22 && lastEvening !== todayStr) {
      this.triggerEveningReminder(todaySchedule).then((success) => {
        if (success) localStorage.setItem(STORAGE_KEYS.LAST_EVENING, todayStr);
      });
    }
  },
};
