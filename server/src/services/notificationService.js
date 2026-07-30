import { cacheUtils } from '../utils/cacheUtils.js';

/**
 * Notification & Analytics Architecture Layer (Prepared for Day 5 Notifications & Analytics)
 */
export const NotificationService = {
  /**
   * Evaluate user attendance state and prepare automated alert triggers
   * @param {Object} overallStats 
   * @param {Array<Object>} subjectStats 
   * @returns {Array<Object>} Active notifications/alerts
   */
  evaluateAttendanceAlerts(overallStats = {}, subjectStats = []) {
    const alerts = [];

    // Check critical overall attendance
    const overallPct = overallStats?.overall_attendance_percentage || 0;
    if (overallPct < 75 && (overallStats?.total_marked || 0) > 0) {
      alerts.push({
        id: 'alert_overall_critical',
        type: 'critical',
        title: 'Critical Attendance Warning',
        message: `Overall attendance (${overallPct}%) has dropped below the 75% requirement. Urgent action required!`,
        timestamp: new Date().toISOString(),
        actionUrl: '/attendance',
      });
    }

    // Check individual critical subjects
    subjectStats.forEach((sub) => {
      const subPct = sub.attendance_percentage || 0;
      if (subPct < 75 && (sub.marked || 0) > 0) {
        alerts.push({
          id: `alert_sub_${sub.subject_id}_critical`,
          type: 'warning',
          title: `Low Attendance in ${sub.subject_name}`,
          message: `${sub.subject_name} is at ${subPct}%. ${sub.prediction?.requiredLectures || 1} consecutive lectures needed to recover.`,
          timestamp: new Date().toISOString(),
          subjectId: sub.subject_id,
        });
      }
    });

    return alerts;
  },

  /**
   * Get cached or evaluated notifications payload
   * @param {Object} overallStats 
   * @param {Array<Object>} subjectStats 
   * @returns {Object}
   */
  getNotifications(overallStats, subjectStats) {
    const cacheKey = 'analytics:notifications';
    const cached = cacheUtils.get(cacheKey);
    if (cached) return cached;

    const alerts = this.evaluateAttendanceAlerts(overallStats, subjectStats);
    const result = {
      unreadCount: alerts.length,
      alerts,
      evaluatedAt: new Date().toISOString(),
    };

    cacheUtils.set(cacheKey, result, 15000);
    return result;
  }
};
