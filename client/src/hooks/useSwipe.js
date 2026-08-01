import { useRef, useEffect } from 'react';

/**
 * Custom hook to detect touch swipe gestures (left, right, up, down)
 * @param {Object} options 
 * @param {Function} [options.onSwipeLeft] 
 * @param {Function} [options.onSwipeRight] 
 * @param {number} [options.threshold=50] Minimum swipe distance in pixels
 */
export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchEndPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartPos.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const handleTouchMove = (e) => {
      touchEndPos.current = {
        x: e.targetTouches[0].clientX,
        y: e.targetTouches[0].clientY,
      };
    };

    const handleTouchEnd = () => {
      const deltaX = touchStartPos.current.x - touchEndPos.current.x;
      const deltaY = touchStartPos.current.y - touchEndPos.current.y;

      // Ensure horizontal swipe is dominant over vertical scroll
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold]);
}
