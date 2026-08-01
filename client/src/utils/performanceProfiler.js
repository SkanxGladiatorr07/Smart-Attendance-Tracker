import { Profiler } from 'react';

/**
 * Custom React Profiler callback to measure and log component render performance.
 * Logs slow renders (>16ms target 60fps frame budget) in development mode.
 * 
 * @param {string} id - Component identifier
 * @param {'mount'|'update'|'nested-update'} phase - Profiler render phase
 * @param {number} actualDuration - Time spent rendering the Profiler and its descendants
 * @param {number} baseDuration - Estimated time to render the entire subtree without memoization
 * @param {number} startTime - When React began rendering this update
 * @param {number} commitTime - When React committed this update
 */
export function onRenderProfilerCallback(
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) {
  // Only log slow renders exceeding 16.6ms (single frame budget at 60fps) in development
  if (process.env.NODE_ENV === 'development' && actualDuration > 16.6) {
    console.warn(
      `[Profiler SLOW RENDER] <${id}> (${phase}): Actual ${actualDuration.toFixed(2)}ms | Base ${baseDuration.toFixed(2)}ms (Commit @ ${commitTime.toFixed(0)}ms)`
    );
  }
}

/**
 * Wrapper component for easy Profiler integration
 */
export function ProfileComponent({ id, children }) {
  if (process.env.NODE_ENV !== 'development') {
    return children;
  }

  return (
    <Profiler id={id} onRender={onRenderProfilerCallback}>
      {children}
    </Profiler>
  );
}
