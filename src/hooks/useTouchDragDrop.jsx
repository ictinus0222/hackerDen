import { useState, useRef, useCallback, useMemo } from 'react';

// Throttle function for performance optimization
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();

    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

export const useTouchDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const dragPreviewRef = useRef(null);
  const lastDropZoneRef = useRef(null);

  // Optimized drag preview creation with minimal DOM manipulation
  const createDragPreview = useCallback((element) => {
    try {
      // Clean up existing preview
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }

      // Create lightweight preview instead of full clone
      const preview = document.createElement('div');
      const rect = element.getBoundingClientRect();

      // Copy essential styles only
      preview.className = element.className;
      preview.innerHTML = element.innerHTML;

      // Apply optimized styles
      Object.assign(preview.style, {
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: '9999',
        opacity: '0.85',
        transform: 'rotate(2deg) scale(1.05)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
        borderRadius: '8px',
        transition: 'none',
        maxWidth: '280px',
        fontSize: '14px',
        width: `${rect.width}px`,
        willChange: 'transform' // Optimize for animations
      });

      document.body.appendChild(preview);
      dragPreviewRef.current = preview;
    } catch (error) {
      console.error('Error creating drag preview:', error);
    }
  }, []);

  const handleTouchStart = useCallback((e, item) => {
    try {
      if (!e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();

      setIsDragging(true);
      setDraggedItem(item);
      setTouchOffset({
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      });

      // Create drag preview
      createDragPreview(e.currentTarget);

      // Add haptic feedback if available
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }

      // Prevent scrolling while dragging
      e.preventDefault();
    } catch (error) {
      console.error('Error in handleTouchStart:', error);
    }
  }, [createDragPreview]);

  // Throttled touch move handler for better performance
  const throttledTouchMove = useMemo(
    () => throttle((touch, touchOffset) => {
      try {
        // Update drag preview position with transform for better performance
        if (dragPreviewRef.current) {
          const x = touch.clientX - touchOffset.x;
          const y = touch.clientY - touchOffset.y;
          dragPreviewRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(2deg) scale(1.05)`;
        }

        // Find the element under the touch point
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        const dropZone = elementBelow?.closest('[data-drop-zone]');

        // Only update if drop zone changed to avoid unnecessary DOM manipulation
        if (dropZone !== lastDropZoneRef.current) {
          // Remove previous highlight
          if (lastDropZoneRef.current) {
            lastDropZoneRef.current.classList.remove('touch-drag-over');
          }

          // Add new highlight
          if (dropZone) {
            dropZone.classList.add('touch-drag-over');
          }

          lastDropZoneRef.current = dropZone;
        }
      } catch (error) {
        console.error('Error in throttled touch move:', error);
      }
    }, 16), // ~60fps throttling
    []
  );

  const handleTouchMove = useCallback((e) => {
    try {
      if (!isDragging || !draggedItem || !e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      throttledTouchMove(touch, touchOffset);

      e.preventDefault();
    } catch (error) {
      console.error('Error in handleTouchMove:', error);
    }
  }, [isDragging, draggedItem, touchOffset, throttledTouchMove]);

  const handleTouchEnd = useCallback((e, onDrop) => {
    try {
      if (!isDragging || !draggedItem) return;

      let touch = null;
      if (e.changedTouches && e.changedTouches.length > 0) {
        touch = e.changedTouches[0];
      }

      let dropZone = null;
      if (touch) {
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        dropZone = elementBelow?.closest('[data-drop-zone]');
      }

      // Clean up visual feedback
      if (lastDropZoneRef.current) {
        lastDropZoneRef.current.classList.remove('touch-drag-over');
        lastDropZoneRef.current = null;
      }

      // Handle drop
      if (dropZone && onDrop) {
        const newStatus = dropZone.dataset.dropZone;
        onDrop(draggedItem.$id, newStatus);
      }

      // Clean up drag state
      setIsDragging(false);
      setDraggedItem(null);
      setTouchOffset({ x: 0, y: 0 });

      // Remove drag preview
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }

      e.preventDefault();
    } catch (error) {
      console.error('Error in handleTouchEnd:', error);
      // Clean up state even if there's an error
      setIsDragging(false);
      setDraggedItem(null);
      setTouchOffset({ x: 0, y: 0 });
      if (dragPreviewRef.current) {
        dragPreviewRef.current.remove();
        dragPreviewRef.current = null;
      }
    }
  }, [isDragging, draggedItem]);

  return {
    isDragging,
    draggedItem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    createDragPreview
  };
};