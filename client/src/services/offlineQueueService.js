/**
 * Offline Queue & Caching Service
 * Handles persistent offline queueing for attendance status updates,
 * offline caching of today's attendance schedule, and automatic background sync.
 */

const QUEUE_KEY = 'attendai_offline_queue';
const CACHE_TODAY_KEY = 'attendai_offline_today';

export const offlineQueueService = {
  /**
   * Get all queued offline attendance mutations
   * @returns {Array<Object>} List of queued mutations
   */
  getQueue() {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to parse offline queue:', e);
      return [];
    }
  },

  /**
   * Add or update an attendance mutation in the offline queue.
   * Automatically deduplicates multiple status changes for the same lecture ID.
   * @param {number|string} lectureId - Lecture ID
   * @param {string} status - New attendance status ('present'|'absent'|'pending')
   * @param {number|string} [subjectId] - Subject ID
   */
  enqueue(lectureId, status, subjectId = null) {
    const queue = this.getQueue();
    const existingIndex = queue.findIndex((item) => String(item.lectureId) === String(lectureId));

    const item = {
      id: `off_${Date.now()}_${lectureId}`,
      lectureId,
      status,
      subjectId,
      timestamp: Date.now(),
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = item;
    } else {
      queue.push(item);
    }

    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save to offline queue:', e);
    }
  },

  /**
   * Remove a specific lecture from the offline queue
   * @param {number|string} lectureId 
   */
  removeFromQueue(lectureId) {
    const queue = this.getQueue().filter((item) => String(item.lectureId) !== String(lectureId));
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to update offline queue:', e);
    }
  },

  /**
   * Clear all items from the offline queue
   */
  clearQueue() {
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch (e) {
      console.warn('Failed to clear offline queue:', e);
    }
  },

  /**
   * Cache today's schedule and attendance statistics for offline viewing
   * @param {Object} data - { todaySchedule, subjectStats, overallStats, semesterProgress }
   */
  cacheTodayData(data) {
    try {
      const payload = {
        ...data,
        cachedAt: Date.now(),
      };
      localStorage.setItem(CACHE_TODAY_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to cache today data:', e);
    }
  },

  /**
   * Retrieve cached today's schedule and attendance statistics
   * @returns {Object|null}
   */
  getCachedTodayData() {
    try {
      const data = localStorage.getItem(CACHE_TODAY_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to read cached today data:', e);
      return null;
    }
  },

  /**
   * Synchronize queued offline attendance mutations with backend API
   * @param {Function} markApiFn - Async function to call backend (lectureId, status, subjectId)
   * @returns {Promise<{ syncedCount: number, failedCount: number }>}
   */
  async syncQueue(markApiFn) {
    const queue = this.getQueue();
    if (queue.length === 0) return { syncedCount: 0, failedCount: 0 };

    let syncedCount = 0;
    let failedCount = 0;

    for (const item of queue) {
      try {
        await markApiFn(item.lectureId, item.status, item.subjectId);
        this.removeFromQueue(item.lectureId);
        syncedCount++;
      } catch (err) {
        console.warn(`Failed to sync offline item ${item.lectureId}:`, err);
        failedCount++;
      }
    }

    return { syncedCount, failedCount };
  },
};
