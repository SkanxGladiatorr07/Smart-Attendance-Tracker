/**
 * In-Memory Memory Cache Utility - Provides high-performance TTL caching
 * for backend queries and calculation engines.
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set cache entry with TTL in milliseconds
   * @param {string} key 
   * @param {*} value 
   * @param {number} [ttlMs=10000] Default 10 seconds 
   */
  set(key, value, ttlMs = 10000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get cached entry or null if missing/expired
   * @param {string} key 
   * @returns {*|null}
   */
  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  /**
   * Delete specific key or invalidate keys matching a prefix/pattern
   * @param {string|RegExp} keyOrPattern 
   */
  del(keyOrPattern) {
    if (typeof keyOrPattern === 'string') {
      this.cache.delete(keyOrPattern);
      return;
    }

    if (keyOrPattern instanceof RegExp) {
      for (const key of this.cache.keys()) {
        if (keyOrPattern.test(key)) {
          this.cache.delete(key);
        }
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.clear();
  }
}

export const cacheUtils = new MemoryCache();
