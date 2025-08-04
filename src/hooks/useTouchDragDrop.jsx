import { useState, useRef, useCallback } from 'react';

export const useTouchDragDrop = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [touchOffset, setTouchOffset] = useState({ x: 0, y: 0 });
  const dragPreviewRef = useRef(null);

  const handleTouchStart = useCallback((e, item) => {
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

    // Prevent scrolling while dragging
    e.preventDefault();
  }, [createDragPreview]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || !draggedItem) return;

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
  }, [isDragging, draggedItem, touchOffset]);

  const handleTouchEnd = useCallback((e, onDrop) => {
    if (!isDragging || !draggedItem) return;

    const touch = e.changedTouches[0];
    const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropZone = elementBelow?.closest('[data-drop-zone]');
    
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
    if (dragPreviewRef.current) {
      document.body.removeChild(dragPreviewRef.current);
      dragPreviewRef.current = null;
    }

    e.preventDefault();
  }, [isDragging, draggedItem]);

  const createDragPreview = useCallback((element) => {
    if (dragPreviewRef.current) {
      document.body.removeChild(dragPreviewRef.current);
    }

    const preview = element.cloneNode(true);
    preview.style.position = 'fixed';
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '9999';
    preview.style.opacity = '0.8';
    preview.style.transform = 'rotate(5deg) scale(1.05)';
    preview.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    
    document.body.appendChild(preview);
    dragPreviewRef.current = preview;
  }, []);

  return {
    isDragging,
    draggedItem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    createDragPreview
  };
};