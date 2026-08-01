/**
 * @file useAttendanceTarget.js
 * @description Reusable hook for reading and persisting the user's attendance target percentage.
 *
 * The target percentage (e.g. 75%) is used throughout the app in calculations for
 * safe skips, required lectures, and recommendations.
 *
 * This hook centralises the value to a single source of truth instead of
 * repeating the magic number 75 in 7+ components.
 *
 * Persistence: Stored in `localStorage` under the key `attendai_target_percentage`.
 *
 * @returns {{ target: number, setTarget: Function }}
 *
 * @example
 * const { target, setTarget } = useAttendanceTarget();
 * // target === 75 by default
 * setTarget(80); // user changes their preferred target
 */

import { useState, useCallback } from 'react';

const STORAGE_KEY = 'attendai_target_percentage';
const DEFAULT_TARGET = 75;

/**
 * Reads the persisted target percentage from localStorage.
 * Falls back to DEFAULT_TARGET (75) if not set or invalid.
 * @returns {number}
 */
function readPersistedTarget() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === null) return DEFAULT_TARGET;
    const parsed = Number(stored);
    return Number.isFinite(parsed) && parsed > 0 && parsed <= 100 ? parsed : DEFAULT_TARGET;
  } catch {
    return DEFAULT_TARGET;
  }
}

export function useAttendanceTarget() {
  const [target, setTargetState] = useState(readPersistedTarget);

  /**
   * Update the attendance target and persist it to localStorage.
   * @param {number} newTarget - Must be a number between 1 and 100.
   */
  const setTarget = useCallback((newTarget) => {
    const validated = Number(newTarget);
    if (!Number.isFinite(validated) || validated <= 0 || validated > 100) return;
    setTargetState(validated);
    try {
      localStorage.setItem(STORAGE_KEY, String(validated));
    } catch {
      // localStorage write failed (e.g., private browsing quota) — in-memory value still works
    }
  }, []);

  return { target, setTarget };
}
