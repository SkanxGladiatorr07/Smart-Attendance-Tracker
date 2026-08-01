/**
 * @file cacheUtils.js
 * @module attendai/server/cacheUtils
 * @description In-Memory TTL Cache Utility.
 * Provides high-performance caching for backend queries and calculation engines.
 *
 * Cached entries expire automatically based on a configurable TTL (time-to-live).
 * Keys can be invalidated individually by string, or in bulk using a RegExp pattern.
 *
 * @example
 * cacheUtils.set('stats:live:75', liveData, 5000); // cache for 5 seconds
 * const cached = cacheUtils.get('stats:live:75');   // returns null if expired
 * cacheUtils.del(/^stats:/);                        // invalidate all stats entries
 */

class MemoryCache {
  constructor() {
    /** @type {Map<string, { value: *, expiresAt: number }>} */
    this.cache = new Map();
  }

  /**
   * Store a value in the cache with a TTL expiry.
   * @param {string} key - Cache key
   * @param {*} value - Value to cache
   * @param {number} [ttlMs=10000] - Time-to-live in milliseconds (default 10s)
   */
  set(key, value, ttlMs = 10000) {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Retrieve a cached entry. Returns null if missing or expired.
   * @param {string} key - Cache key
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
   * Delete a specific cache entry or invalidate all keys matching a RegExp pattern.
   * @param {string|RegExp} keyOrPattern - Exact string key or RegExp to match multiple keys
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
   * Clear all cache entries immediately.
   */
  clear() {
    this.cache.clear();
  }
}

export const cacheUtils = new MemoryCache();
