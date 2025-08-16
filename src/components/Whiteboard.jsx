import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { databases } from '../lib/appwrite';
import client, { ID, Query } from '../lib/appwrite';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import LoadingSpinner from './LoadingSpinner';

const COLLECTION_ID = 'whiteboard_objects';

const Whiteboard = () => {
  const { hackathonId } = useParams();
  const { team, loading: teamLoading } = useHackathonTeam(hackathonId);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [objects, setObjects] = useState([]);
  const [selectedObject, setSelectedObject] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [showZoomWarning, setShowZoomWarning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [drawingShape, setDrawingShape] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [originalDragStart, setOriginalDragStart] = useState({ x: 0, y: 0 });
  const [originalObjectPos, setOriginalObjectPos] = useState({ x: 0, y: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [isUpdatingObject, setIsUpdatingObject] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [imageCache, setImageCache] = useState(new Map());
  const [imageLoadTrigger, setImageLoadTrigger] = useState(0);

  // Helper function to compress image
  const compressImage = (file, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        // Set canvas size
        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // Initialize canvas and setup real-time sync
  useEffect(() => {
    if (!team?.$id || !hackathonId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Load existing objects
    loadObjects();

    // Setup real-time subscription for this team's whiteboard
    const unsubscribe = client.subscribe(`databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${COLLECTION_ID}.documents`, (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*')) {
        // Don't reload objects if we're currently updating an object locally
        // This prevents real-time updates from interfering with dragging
        if (!isUpdatingObject) {
          loadObjects();
        }
      }
    });

    // Handle clipboard paste for images
    const handlePaste = async (e) => {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();

          // Validate file size (max 10MB)
          if (blob.size > 10 * 1024 * 1024) {
            alert('Pasted image is too large. Please use an image smaller than 10MB.');
            return;
          }

          try {
            // Compress the image
            let compressedDataUrl = await compressImage(blob, 800, 0.7);

            // Check compressed size
            if (compressedDataUrl.length > 80000) {
              // Try with more compression
              const moreCompressed = await compressImage(blob, 600, 0.5);
              if (moreCompressed.length > 80000) {
                alert('Pasted image is too complex. Please try a simpler image.');
                return;
              }
              compressedDataUrl = moreCompressed;
            }

            const centerX = (window.innerWidth / 2 - canvasOffset.x) / zoom;
            const centerY = (window.innerHeight / 2 - canvasOffset.y) / zoom;

            // Create a temporary image to get actual dimensions for display
            const tempImg = new Image();
            tempImg.onload = () => {
              // Calculate appropriate display size (max 300px while maintaining aspect ratio)
              const maxSize = 300;
              let width = tempImg.width;
              let height = tempImg.height;

              if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width *= ratio;
                height *= ratio;
              }

              const imageObject = {
                type: 'image',
                x: centerX - width / 2,
                y: centerY - height / 2,
                width: width,
                height: height,
                imageUrl: compressedDataUrl
              };

              saveObject(imageObject);
            };
            tempImg.src = compressedDataUrl;
          } catch (error) {
            console.error('Error processing pasted image:', error);
            alert('Error processing pasted image. Please try again.');
          }
          break;
        }
      }
    };

    // Prevent context menu on canvas
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Add event listeners
    document.addEventListener('paste', handlePaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('contextmenu', handleContextMenu);

    return () => {
      unsubscribe();
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('contextmenu', handleContextMenu);
      }
    };
  }, [team?.$id, hackathonId, canvasOffset, zoom, isUpdatingObject]);

  // Load objects from Appwrite (filtered by team and hackathon)
  const loadObjects = async () => {
    if (!team?.$id || !hackathonId) return;

    try {
      const response = await databases.listDocuments(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        COLLECTION_ID,
        [
          Query.equal('teamId', team.$id),
          Query.equal('hackathonId', hackathonId)
        ]
      );
      setObjects(response.documents);
    } catch (error) {
      console.error('Error loading objects:', error);
    }
  };

  // Save object to Appwrite and local state (with team and hackathon context)
  const saveObject = async (objectData) => {
    if (!team?.$id || !hackathonId) return;

    try {
      const objectId = ID.unique();
      const fullObjectData = {
        ...objectData,
        teamId: team.$id,
        hackathonId: hackathonId
      };

      // Add to local state immediately with temporary ID
      const newObject = { $id: objectId, ...fullObjectData };
      setObjects(prevObjects => [...prevObjects, newObject]);

      // Save to Appwrite (temporarily filter out fillColor if not supported)
      const { fillColor, ...dataToSave } = fullObjectData;
      const finalData = fillColor ? { ...dataToSave, fillColor } : dataToSave;

      try {
        await databases.createDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          objectId,
          finalData
        );
      } catch (error) {
        if (error.message.includes('fillColor')) {
          // Retry without fillColor if the attribute doesn't exist
          console.warn('fillColor attribute not found, saving without it. Please update your database schema.');
          await databases.createDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            objectId,
            dataToSave
          );
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Error saving object:', error);
      // Reload objects on error to sync state
      loadObjects();
    }
  };

  // Update object in Appwrite and local state
  const updateObject = async (objectId, updates) => {
    try {
      setIsUpdatingObject(true);

      // Update local state immediately for smooth interaction
      setObjects(prevObjects =>
        prevObjects.map(obj =>
          obj.$id === objectId ? { ...obj, ...updates } : obj
        )
      );

      // Update selected object if it's the one being modified
      if (selectedObject && selectedObject.$id === objectId) {
        setSelectedObject(prev => ({ ...prev, ...updates }));
      }

      // Update in Appwrite (temporarily handle fillColor gracefully)
      try {
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          objectId,
          updates
        );
      } catch (error) {
        if (error.message.includes('fillColor')) {
          // Retry without fillColor if the attribute doesn't exist
          console.warn('fillColor attribute not found, updating without it. Please update your database schema.');
          const { fillColor, ...updatesWithoutFill } = updates;
          await databases.updateDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            objectId,
            updatesWithoutFill
          );
        } else {
          throw error;
        }
      }

      // Small delay to prevent race conditions with real-time updates
      setTimeout(() => setIsUpdatingObject(false), 100);
    } catch (error) {
      console.error('Error updating object:', error);
      setIsUpdatingObject(false);
      // Reload objects on error to sync state
      loadObjects();
    }
  };

  // Delete object from Appwrite and local state
  const deleteObject = async (objectId) => {
    try {
      // Update local state immediately
      setObjects(prevObjects => prevObjects.filter(obj => obj.$id !== objectId));

      // Clear selection if deleted object was selected
      if (selectedObject && selectedObject.$id === objectId) {
        setSelectedObject(null);
      }

      // Delete from Appwrite
      await databases.deleteDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        COLLECTION_ID,
        objectId
      );
    } catch (error) {
      console.error('Error deleting object:', error);
      // Reload objects on error to sync state
      loadObjects();
    }
  };

  // Enhanced keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    console.log('Key pressed:', e.key, 'Selected object:', selectedObject?.$id);

    // Prevent browser zoom shortcuts
    if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=' || e.key === '_')) {
      e.preventDefault();
      setShowZoomWarning(true);
      setTimeout(() => setShowZoomWarning(false), 2000);
      return false;
    }

    // Space key for panning
    if (e.code === 'Space' && !isSpacePressed) {
      e.preventDefault();
      setIsSpacePressed(true);
      return;
    }

    // Tool shortcuts
    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      switch (e.key.toLowerCase()) {
        case 'v':
        case '1':
          setCurrentTool('select');
          break;
        case 'p':
        case '2':
          setCurrentTool('pen');
          break;
        case 'e':
        case '3':
          setCurrentTool('eraser');
          break;
        case 'r':
        case '4':
          setCurrentTool('rectangle');
          break;
        case 'c':
        case '5':
          setCurrentTool('circle');
          break;
        case 'l':
        case '6':
          setCurrentTool('line');
          break;
        case 'h':
        case ' ':
          if (!isSpacePressed) {
            setCurrentTool('pan');
          }
          break;
      }
    }

    // Delete selected object
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedObject) {
      console.log('Delete key pressed, deleting object:', selectedObject.$id);
      e.preventDefault();
      deleteObject(selectedObject.$id);
      setSelectedObject(null);
    }

    // Escape to deselect
    if (e.key === 'Escape') {
      setSelectedObject(null);
      setCurrentTool('select');
    }
  }, [selectedObject, isSpacePressed, deleteObject]);

  const handleKeyUp = useCallback((e) => {
    if (e.code === 'Space') {
      setIsSpacePressed(false);
    }
  }, []);

  // Render canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(canvasOffset.x, canvasOffset.y);
    ctx.scale(zoom, zoom);

    // Render all objects
    objects.forEach(obj => {
      ctx.save();

      if (obj.type === 'path') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const points = JSON.parse(obj.points);
        if (points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i].x, points[i].y);
          }
          ctx.stroke();
        }
      } else if (obj.type === 'rectangle') {
        // Fill if fillColor is set
        if (obj.fillColor && obj.fillColor !== 'transparent') {
          ctx.fillStyle = obj.fillColor;
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
        // Stroke
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.strokeWidth;
        ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
      } else if (obj.type === 'circle') {
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);

        // Fill if fillColor is set
        if (obj.fillColor && obj.fillColor !== 'transparent') {
          ctx.fillStyle = obj.fillColor;
          ctx.fill();
        }
        // Stroke
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.strokeWidth;
        ctx.stroke();
      } else if (obj.type === 'line') {
        ctx.strokeStyle = obj.color;
        ctx.lineWidth = obj.strokeWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(obj.x, obj.y);
        ctx.lineTo(obj.x + obj.width, obj.y + obj.height);
        ctx.stroke();
      } else if (obj.type === 'image' && obj.imageUrl) {
        // Check if image is already cached and loaded
        const cachedImg = imageCache.get(obj.imageUrl);
        if (cachedImg && cachedImg.complete && cachedImg.naturalWidth > 0 && !cachedImg.failed) {
          // Image is loaded and ready to draw
          ctx.drawImage(cachedImg, obj.x, obj.y, obj.width, obj.height);
        } else if (cachedImg && cachedImg.failed) {
          // Image failed to load, show error placeholder
          ctx.fillStyle = '#ffebee';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = '#f44336';
          ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

          // Error text
          ctx.fillStyle = '#f44336';
          ctx.font = '12px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Failed to load', obj.x + obj.width / 2, obj.y + obj.height / 2);
        } else if (!cachedImg) {
          // Image not in cache, start loading
          const img = new Image();
          img.onload = () => {
            // Mark as loaded and trigger re-render
            setImageCache(prev => new Map(prev).set(obj.imageUrl, img));
            setImageLoadTrigger(prev => prev + 1);
          };
          img.onerror = () => {
            console.error('Failed to load image:', obj.imageUrl);
            // Mark as failed
            const failedImg = new Image();
            failedImg.failed = true;
            setImageCache(prev => new Map(prev).set(obj.imageUrl, failedImg));
            setImageLoadTrigger(prev => prev + 1);
          };
          img.src = obj.imageUrl;

          // Add to cache immediately as loading
          setImageCache(prev => new Map(prev).set(obj.imageUrl, img));

          // Show loading placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

          // Loading text
          ctx.fillStyle = '#666';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading...', obj.x + obj.width / 2, obj.y + obj.height / 2);
        } else {
          // Image is loading, show placeholder
          ctx.fillStyle = '#f0f0f0';
          ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
          ctx.strokeStyle = '#ccc';
          ctx.lineWidth = 1;
          ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);

          // Loading text
          ctx.fillStyle = '#666';
          ctx.font = '14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Loading...', obj.x + obj.width / 2, obj.y + obj.height / 2);
        }
      }

      ctx.restore();
    });

    // Draw selection handles for selected object
    if (selectedObject) {
      const bounds = getObjectBounds(selectedObject);
      ctx.save();

      // Debug: Show stored bounds vs calculated bounds for paths
      if (selectedObject.type === 'path') {
        // Show stored bounds in red (for debugging)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([2 / zoom, 2 / zoom]);
        ctx.strokeRect(selectedObject.x, selectedObject.y, selectedObject.width, selectedObject.height);
        ctx.setLineDash([]);
      }

      // If dragging, show a semi-transparent preview
      if (isDragging) {
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([10 / zoom, 5 / zoom]);
        ctx.strokeRect(bounds.x - 5 / zoom, bounds.y - 5 / zoom, bounds.width + 10 / zoom, bounds.height + 10 / zoom);
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;
      } else {
        // Normal selection outline
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2 / zoom;
        ctx.setLineDash([5 / zoom, 5 / zoom]);
        ctx.strokeRect(bounds.x - 5 / zoom, bounds.y - 5 / zoom, bounds.width + 10 / zoom, bounds.height + 10 / zoom);
        ctx.setLineDash([]);

        // Resize handles (only show when not dragging)
        const handleSize = 8 / zoom;
        ctx.fillStyle = '#007bff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1 / zoom;

        const handles = [
          { x: bounds.x, y: bounds.y }, // nw
          { x: bounds.x + bounds.width, y: bounds.y }, // ne
          { x: bounds.x, y: bounds.y + bounds.height }, // sw
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // se
          { x: bounds.x + bounds.width / 2, y: bounds.y }, // n
          { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // s
          { x: bounds.x, y: bounds.y + bounds.height / 2 }, // w
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 } // e
        ];

        handles.forEach(handle => {
          ctx.fillRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(handle.x - handleSize / 2, handle.y - handleSize / 2, handleSize, handleSize);
        });
      }

      ctx.restore();
    }

    // Draw current path while drawing
    if (currentPath.length > 1 && isDrawing) {
      if (currentTool === 'pen') {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
      } else if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = strokeWidth * 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
          ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    // Draw current shape while drawing
    if (drawingShape) {
      const { startPos, currentPos, type } = drawingShape;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = strokeWidth;
      ctx.setLineDash([5, 5]);

      if (type === 'rectangle') {
        const width = currentPos.x - startPos.x;
        const height = currentPos.y - startPos.y;
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (type === 'circle') {
        const radius = Math.sqrt(Math.pow(currentPos.x - startPos.x, 2) + Math.pow(currentPos.y - startPos.y, 2));
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (type === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(currentPos.x, currentPos.y);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    ctx.restore();
  }, [objects, selectedObject, canvasOffset, zoom, currentPath, isDrawing, currentColor, strokeWidth, imageLoadTrigger]);

  // Re-render when objects change
  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - canvasOffset.x) / zoom,
      y: (e.clientY - rect.top - canvasOffset.y) / zoom
    };
  };

  // Get object bounds for selection and collision detection
  const getObjectBounds = (obj) => {
    if (obj.type === 'path') {
      const points = JSON.parse(obj.points);
      if (points.length === 0) return { x: obj.x || 0, y: obj.y || 0, width: 0, height: 0 };

      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    }
    return { x: obj.x, y: obj.y, width: obj.width || 0, height: obj.height || 0 };
  };

  // Check if point is inside object
  const isPointInObject = (pos, obj) => {
    const bounds = getObjectBounds(obj);
    return pos.x >= bounds.x && pos.x <= bounds.x + bounds.width &&
      pos.y >= bounds.y && pos.y <= bounds.y + bounds.height;
  };

  // Get resize handle at position
  const getResizeHandle = (pos, obj) => {
    const bounds = getObjectBounds(obj);
    const handleSize = 8 / zoom; // Adjust handle size based on zoom

    const handles = {
      'nw': { x: bounds.x, y: bounds.y },
      'ne': { x: bounds.x + bounds.width, y: bounds.y },
      'sw': { x: bounds.x, y: bounds.y + bounds.height },
      'se': { x: bounds.x + bounds.width, y: bounds.y + bounds.height },
      'n': { x: bounds.x + bounds.width / 2, y: bounds.y },
      's': { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height },
      'w': { x: bounds.x, y: bounds.y + bounds.height / 2 },
      'e': { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }
    };

    for (const [handle, handlePos] of Object.entries(handles)) {
      if (Math.abs(pos.x - handlePos.x) <= handleSize && Math.abs(pos.y - handlePos.y) <= handleSize) {
        return handle;
      }
    }
    return null;
  };

  // Mouse down handler
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    // Pan with space key or pan tool
    if (currentTool === 'pan' || isSpacePressed) {
      setIsPanning(true);
      setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
      return;
    }

    if (currentTool === 'select') {
      // Check if clicking on resize handle of selected object
      if (selectedObject) {
        const handle = getResizeHandle(pos, selectedObject);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart(pos);
          return;
        }
      }

      // Check if clicking on an object (search from top to bottom - last drawn first)
      const clickedObject = [...objects].reverse().find(obj => isPointInObject(pos, obj));

      if (clickedObject) {
        // console.log('Object selected:', clickedObject.type, clickedObject.$id);
        setSelectedObject(clickedObject);

        // Ensure canvas has focus for keyboard events
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.focus();
        }

        // Only start dragging if we're clicking on the same object that's already selected
        // or if no object was previously selected
        if (!selectedObject || selectedObject.$id === clickedObject.$id) {
          setIsDragging(true);
          setDragStart(pos);
          setOriginalDragStart(pos);
          setOriginalObjectPos({ x: clickedObject.x, y: clickedObject.y });
          // console.log('Started dragging at:', pos, 'object at:', clickedObject.x, clickedObject.y);
        }
      } else {
        // console.log('No object clicked, deselecting');
        setSelectedObject(null);
        setIsDragging(false);
      }
      return;
    }

    if (currentTool === 'pen' || currentTool === 'eraser') {
      setIsDrawing(true);
      setCurrentPath([pos]);
    }

    if (currentTool === 'rectangle' || currentTool === 'circle' || currentTool === 'line') {
      setDrawingShape({
        type: currentTool,
        startPos: pos,
        currentPos: pos
      });
    }
  };

  // Mouse move handler
  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    // Update cursor based on context
    const canvas = canvasRef.current;
    if (canvas) {
      if (currentTool === 'pan' || isSpacePressed) {
        canvas.style.cursor = isPanning ? 'grabbing' : 'grab';
      } else if (currentTool === 'select' && selectedObject) {
        const handle = getResizeHandle(pos, selectedObject);
        if (handle) {
          const cursors = {
            'nw': 'nw-resize', 'ne': 'ne-resize', 'sw': 'sw-resize', 'se': 'se-resize',
            'n': 'n-resize', 's': 's-resize', 'w': 'w-resize', 'e': 'e-resize'
          };
          canvas.style.cursor = cursors[handle];
        } else if (isPointInObject(pos, selectedObject)) {
          canvas.style.cursor = 'move';
        } else {
          canvas.style.cursor = 'default';
        }
      } else {
        canvas.style.cursor = currentTool === 'eraser' ? 'crosshair' : 'crosshair';
      }
    }

    if (isPanning) {
      setCanvasOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
      return;
    }

    if (isResizing && selectedObject && resizeHandle) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      const bounds = getObjectBounds(selectedObject);

      let newBounds = { ...bounds };

      // Handle different resize directions
      switch (resizeHandle) {
        case 'se':
          newBounds.width = Math.max(10, bounds.width + deltaX);
          newBounds.height = Math.max(10, bounds.height + deltaY);
          break;
        case 'nw':
          newBounds.x = bounds.x + deltaX;
          newBounds.y = bounds.y + deltaY;
          newBounds.width = Math.max(10, bounds.width - deltaX);
          newBounds.height = Math.max(10, bounds.height - deltaY);
          break;
        case 'ne':
          newBounds.y = bounds.y + deltaY;
          newBounds.width = Math.max(10, bounds.width + deltaX);
          newBounds.height = Math.max(10, bounds.height - deltaY);
          break;
        case 'sw':
          newBounds.x = bounds.x + deltaX;
          newBounds.width = Math.max(10, bounds.width - deltaX);
          newBounds.height = Math.max(10, bounds.height + deltaY);
          break;
        case 'n':
          newBounds.y = bounds.y + deltaY;
          newBounds.height = Math.max(10, bounds.height - deltaY);
          break;
        case 's':
          newBounds.height = Math.max(10, bounds.height + deltaY);
          break;
        case 'w':
          newBounds.x = bounds.x + deltaX;
          newBounds.width = Math.max(10, bounds.width - deltaX);
          break;
        case 'e':
          newBounds.width = Math.max(10, bounds.width + deltaX);
          break;
      }

      updateObject(selectedObject.$id, {
        x: newBounds.x,
        y: newBounds.y,
        width: newBounds.width,
        height: newBounds.height
      });
      setDragStart(pos);
      return;
    }

    if (isDragging && selectedObject) {
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;

      // Only move if we've dragged more than 1 pixel (prevents accidental micro-movements)
      const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (dragDistance < 1) return;

      // Throttle updates to prevent too many rapid database calls
      const now = Date.now();
      if (now - lastUpdateTime < 50) return; // Reduced frequency for stability
      setLastUpdateTime(now);

      // console.log('Dragging object:', selectedObject.type, 'delta:', deltaX, deltaY);

      let updateData;
      if (selectedObject.type === 'path') {
        // Move path by updating all points
        const points = JSON.parse(selectedObject.points);
        const newPoints = points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));

        // Calculate new bounding box from the moved points
        const minX = Math.min(...newPoints.map(p => p.x));
        const minY = Math.min(...newPoints.map(p => p.y));
        const maxX = Math.max(...newPoints.map(p => p.x));
        const maxY = Math.max(...newPoints.map(p => p.y));

        updateData = {
          points: JSON.stringify(newPoints),
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };
      } else {
        updateData = {
          x: selectedObject.x + deltaX,
          y: selectedObject.y + deltaY
        };
      }

      // Update local state immediately for smooth dragging
      setObjects(prevObjects =>
        prevObjects.map(obj =>
          obj.$id === selectedObject.$id ? { ...obj, ...updateData } : obj
        )
      );

      // Update selected object state
      setSelectedObject(prev => ({ ...prev, ...updateData }));

      // Store pending update for database sync
      setPendingUpdate({ objectId: selectedObject.$id, updates: updateData });

      // Update drag start for next movement
      setDragStart(pos);
      return;
    }

    if (isDrawing && (currentTool === 'pen' || currentTool === 'eraser')) {
      setCurrentPath(prev => [...prev, pos]);
    }

    if (drawingShape) {
      setDrawingShape(prev => ({ ...prev, currentPos: pos }));
    }
  };

  // Mouse up handler
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
      return;
    }

    if (isDragging) {
      setIsDragging(false);

      // Flush any pending update to database when dragging stops
      if (pendingUpdate) {
        updateObject(pendingUpdate.objectId, pendingUpdate.updates);
        setPendingUpdate(null);
      }
      return;
    }

    if (drawingShape && drawingShape.startPos && drawingShape.currentPos) {
      const { startPos, currentPos, type } = drawingShape;
      const width = Math.abs(currentPos.x - startPos.x);
      const height = Math.abs(currentPos.y - startPos.y);

      if (width > 5 && height > 5) { // Minimum size threshold
        const shapeObject = {
          type: type,
          x: Math.min(startPos.x, currentPos.x),
          y: Math.min(startPos.y, currentPos.y),
          width: type === 'line' ? currentPos.x - startPos.x : width,
          height: type === 'line' ? currentPos.y - startPos.y : height,
          color: currentColor,
          fillColor: fillColor,
          strokeWidth: strokeWidth
        };

        saveObject(shapeObject);
      }
      setDrawingShape(null);
      return;
    }

    if (isDrawing && currentPath.length > 1) {
      if (currentTool === 'pen') {
        const minX = Math.min(...currentPath.map(p => p.x));
        const minY = Math.min(...currentPath.map(p => p.y));
        const maxX = Math.max(...currentPath.map(p => p.x));
        const maxY = Math.max(...currentPath.map(p => p.y));

        const pathObject = {
          type: 'path',
          points: JSON.stringify(currentPath),
          color: currentColor,
          strokeWidth: strokeWidth,
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY
        };

        saveObject(pathObject);
      } else if (currentTool === 'eraser') {
        // Eraser: remove objects that intersect with the eraser path
        const pathBounds = {
          x: Math.min(...currentPath.map(p => p.x)),
          y: Math.min(...currentPath.map(p => p.y)),
          width: Math.max(...currentPath.map(p => p.x)) - Math.min(...currentPath.map(p => p.x)),
          height: Math.max(...currentPath.map(p => p.y)) - Math.min(...currentPath.map(p => p.y))
        };

        // Find objects that intersect with eraser path
        const objectsToErase = objects.filter(obj => {
          const objBounds = getObjectBounds(obj);
          return !(pathBounds.x > objBounds.x + objBounds.width ||
            pathBounds.x + pathBounds.width < objBounds.x ||
            pathBounds.y > objBounds.y + objBounds.height ||
            pathBounds.y + pathBounds.height < objBounds.y);
        });

        // Delete intersecting objects
        objectsToErase.forEach(obj => deleteObject(obj.$id));
      }

      setCurrentPath([]);
    }

    setIsDrawing(false);
  };

  // Wheel handler for zooming
  const handleWheel = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent browser zoom when Ctrl is held
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      return false;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5, zoom * delta));

    // Zoom towards mouse position
    const zoomChange = newZoom / zoom;
    const newOffsetX = mouseX - (mouseX - canvasOffset.x) * zoomChange;
    const newOffsetY = mouseY - (mouseY - canvasOffset.y) * zoomChange;

    setZoom(newZoom);
    setCanvasOffset({ x: newOffsetX, y: newOffsetY });
  };



  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 10MB.');
      return;
    }

    try {
      // Compress the image
      let compressedDataUrl = await compressImage(file, 800, 0.7);

      // Check compressed size (base64 is ~33% larger than binary)
      if (compressedDataUrl.length > 80000) {
        // Try with more compression
        const moreCompressed = await compressImage(file, 600, 0.5);
        if (moreCompressed.length > 80000) {
          alert('Image is too complex to upload. Please try a simpler image or smaller file.');
          return;
        }
        compressedDataUrl = moreCompressed;
      }

      const centerX = (window.innerWidth / 2 - canvasOffset.x) / zoom;
      const centerY = (window.innerHeight / 2 - canvasOffset.y) / zoom;

      // Create a temporary image to get actual dimensions for display
      const tempImg = new Image();
      tempImg.onload = () => {
        // Calculate appropriate display size (max 300px while maintaining aspect ratio)
        const maxSize = 300;
        let width = tempImg.width;
        let height = tempImg.height;

        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width *= ratio;
          height *= ratio;
        }

        const imageObject = {
          type: 'image',
          x: centerX - width / 2,
          y: centerY - height / 2,
          width: width,
          height: height,
          imageUrl: compressedDataUrl
        };

        saveObject(imageObject);
      };
      tempImg.src = compressedDataUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try a different image.');
    }

    // Clear the input so the same file can be selected again
    e.target.value = '';
  };

  // Delete selected object
  const deleteSelected = () => {
    if (selectedObject) {
      deleteObject(selectedObject.$id);
      setSelectedObject(null);
    }
  };

  // Show loading state while team is loading
  if (teamLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <LoadingSpinner message="Loading team whiteboard..." />
      </div>
    );
  }

  // Show message if user doesn't have a team
  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Team Found</h3>
          <p className="text-gray-600 mb-4">You need to be part of a team to access the whiteboard.</p>
          <p className="text-sm text-gray-500">Go back to the dashboard to create or join a team.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-gray-100"
      style={{
        touchAction: 'none', // Prevent touch gestures from interfering
        userSelect: 'none'   // Prevent text selection
      }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        tabIndex={0}
        onMouseDown={(e) => {
          // Focus the canvas when clicked to ensure keyboard events work
          e.currentTarget.focus();
          handleMouseDown(e);
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        style={{
          cursor: currentTool === 'pan' ? 'grab' : 'crosshair',
          touchAction: 'none', // Prevent touch zoom/pan
          userSelect: 'none',   // Prevent selection
          outline: 'none'       // Remove focus outline
        }}
      />

      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 flex flex-col gap-3 max-w-xs">
        {/* Tool Selection */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setCurrentTool('select')}
            className={`p-2 rounded text-sm ${currentTool === 'select' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Select/Move (V)"
          >
            ↖️
          </button>
          <button
            onClick={() => setCurrentTool('pen')}
            className={`p-2 rounded text-sm ${currentTool === 'pen' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Pen (P)"
          >
            ✏️
          </button>
          <button
            onClick={() => setCurrentTool('eraser')}
            className={`p-2 rounded text-sm ${currentTool === 'eraser' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Eraser (E)"
          >
            🧹
          </button>
          <button
            onClick={() => setCurrentTool('rectangle')}
            className={`p-2 rounded text-sm ${currentTool === 'rectangle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Rectangle (R)"
          >
            ⬜
          </button>
          <button
            onClick={() => setCurrentTool('circle')}
            className={`p-2 rounded text-sm ${currentTool === 'circle' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Circle (C)"
          >
            ⭕
          </button>
          <button
            onClick={() => setCurrentTool('line')}
            className={`p-2 rounded text-sm ${currentTool === 'line' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            title="Line (L)"
          >
            📏
          </button>
        </div>

        {/* Pan Tool */}
        <button
          onClick={() => setCurrentTool('pan')}
          className={`p-2 rounded w-full ${currentTool === 'pan' || isSpacePressed ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          title="Pan (H or Space)"
        >
          ✋ {isSpacePressed ? '(Space held)' : 'Pan'}
        </button>

        {/* Color Properties */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-center">
            <label className="text-xs font-medium">Stroke:</label>
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setCurrentColor(e.target.value)}
              className="w-8 h-8 rounded border"
              title="Stroke Color"
            />
          </div>

          {(currentTool === 'rectangle' || currentTool === 'circle') && (
            <div className="flex gap-2 items-center">
              <label className="text-xs font-medium">Fill:</label>
              <input
                type="color"
                value={fillColor}
                onChange={(e) => setFillColor(e.target.value)}
                className="w-8 h-8 rounded border"
                title="Fill Color"
              />
              <button
                onClick={() => setFillColor('transparent')}
                className={`px-2 py-1 text-xs rounded ${fillColor === 'transparent' ? 'bg-gray-400 text-white' : 'bg-gray-200'}`}
                title="No Fill"
              >
                None
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium">Width: {strokeWidth}px</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="w-full"
              title="Stroke Width"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="block p-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer text-center text-sm"
          >
            📷 Add Image
          </label>
        </div>

        {/* Selected Object Actions */}
        {selectedObject && (
          <div className="border-t pt-2">
            <div className="text-xs font-medium mb-2">
              Selected: {selectedObject.type}
              {isDragging && <span className="text-blue-500"> (dragging)</span>}
              {isResizing && <span className="text-green-500"> (resizing)</span>}
            </div>
            <button
              onClick={deleteSelected}
              className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              title="Delete Selected (Del)"
            >
              🗑️ Delete
            </button>
          </div>
        )}
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={() => {
            const newZoom = Math.min(5, zoom * 1.2);
            setZoom(newZoom);
          }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          title="Zoom In"
        >
          🔍+
        </button>
        <span className="text-xs text-center">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => {
            const newZoom = Math.max(0.1, zoom * 0.8);
            setZoom(newZoom);
          }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300"
          title="Zoom Out"
        >
          🔍-
        </button>
        <button
          onClick={() => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}
          className="p-2 bg-gray-200 rounded hover:bg-gray-300 text-xs"
          title="Reset View"
        >
          Reset
        </button>
      </div>

      {/* Zoom Warning */}
      {showZoomWarning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="text-center">
            <div className="font-semibold">Use Mouse Wheel to Zoom</div>
            <div className="text-sm">Browser zoom is disabled on the whiteboard</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs text-gray-600 max-w-sm">
        <div className="font-semibold mb-2">Keyboard Shortcuts:</div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>V - Select</div>
          <div>P - Pen</div>
          <div>E - Eraser</div>
          <div>R - Rectangle</div>
          <div>C - Circle</div>
          <div>L - Line</div>
          <div>H/Space - Pan</div>
          <div>Del - Delete</div>
          <div>Esc - Deselect</div>
          <div>Ctrl+V - Paste</div>
        </div>
        <div className="mt-2 pt-2 border-t">
          <div>• Mouse wheel: Zoom</div>
          <div>• Drag handles: Resize</div>
          <div>• Right-click disabled</div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;