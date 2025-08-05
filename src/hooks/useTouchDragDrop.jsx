import { useState, useRef, useCallback } from 'react';

export const useTouchDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const dragPreviewRef = useRef(null);

  const createDragPreview = useCallback((element) => {
    try {
      if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
        document.body.removeChild(dragPreviewRef.current);
      }

      const preview = element.cloneNode(true);
      preview.style.position = 'fixed';
      preview.style.pointerEvents = 'none';
      preview.style.zIndex = '9999';
      preview.style.opacity = '0.9';
      preview.style.transform = 'rotate(3deg) scale(1.1)';
      preview.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4)';
      preview.style.borderRadius = '8px';
      preview.style.transition = 'none';
      
      // Ensure preview is visible on mobile
      preview.style.maxWidth = '280px';
      preview.style.fontSize = '14px';
      
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

  const handleTouchMove = useCallback((e) => {
    try {
      if (!isDragging || !draggedItem || !e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      
      // Update drag preview position
      if (dragPreviewRef.current) {
        dragPreviewRef.current.style.left = `${touch.clientX - touchOffset.x}px`;
        dragPreviewRef.current.style.top = `${touch.clientY - touchOffset.y}px`;
      }

      // Find the element under the touch point
      const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropZone = elementBelow?.closest('[data-drop-zone]');
      
      // Update drop zone visual feedback
      document.querySelectorAll('[data-drop-zone]').forEach(zone => {
        zone.classList.remove('touch-drag-over');
      });
      
      if (dropZone) {
        dropZone.classList.add('touch-drag-over');
      }

      e.preventDefault();
    } catch (error) {
      console.error('Error in handleTouchMove:', error);
    }
  }, [isDragging, draggedItem, touchOffset]);

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
      document.querySelectorAll('[data-drop-zone]').forEach(zone => {
        zone.classList.remove('touch-drag-over');
      });

      if (dropZone && onDrop) {
        const newStatus = dropZone.dataset.dropZone;
        onDrop(draggedItem.$id, newStatus);
      }

      // Clean up drag state
      setIsDragging(false);
      setDraggedItem(null);
      setTouchOffset({ x: 0, y: 0 });

      // Remove drag preview
      try {
        if (dragPreviewRef.current && document.body.contains(dragPreviewRef.current)) {
          document.body.removeChild(dragPreviewRef.current);
          dragPreviewRef.current = null;
        }
      } catch (error) {
        console.error('Error removing drag preview:', error);
        dragPreviewRef.current = null;
      }

      e.preventDefault();
    } catch (error) {
      console.error('Error in handleTouchEnd:', error);
      // Clean up state even if there's an error
      setIsDragging(false);
      setDraggedItem(null);
      setTouchOffset({ x: 0, y: 0 });
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