import { useEffect, useRef } from 'react';

/**
 * Custom hook for handling swipe gestures on mobile devices
 * @param {Object} options - Configuration options
 * @param {Function} options.onSwipeLeft - Callback for left swipe
 * @param {Function} options.onSwipeRight - Callback for right swipe
 * @param {number} options.threshold - Minimum distance for swipe (default: 50)
 * @param {number} options.restraint - Maximum perpendicular distance (default: 100)
 * @param {number} options.allowedTime - Maximum time for swipe (default: 300ms)
 * @returns {Object} - Ref to attach to element and gesture state
 */
export const useSwipeGesture = ({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  restraint = 100,
  allowedTime = 300
} = {}) => {
  const elementRef = useRef(null);
  const touchStartRef = useRef(null);
  const touchTimeRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e) => {
      const touch = e.changedTouches[0];
      touchStartRef.current = {
        x: touch.pageX,
        y: touch.pageY
      };
      touchTimeRef.current = new Date().getTime();
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || !touchTimeRef.current) return;

      const touch = e.changedTouches[0];
      const distX = touch.pageX - touchStartRef.current.x;
      const distY = touch.pageY - touchStartRef.current.y;
      const elapsedTime = new Date().getTime() - touchTimeRef.current;

      // Check if swipe meets criteria
      if (elapsedTime <= allowedTime) {
        if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
          if (distX > 0 && onSwipeRight) {
            onSwipeRight(e);
          } else if (distX < 0 && onSwipeLeft) {
            onSwipeLeft(e);
          }
        }
      }

      // Reset
      touchStartRef.current = null;
      touchTimeRef.current = null;
    };

    // Add passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, restraint, allowedTime]);

  return { elementRef };
};