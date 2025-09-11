import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { databases, COLLECTIONS } from '../lib/appwrite';
import client, { ID, Query } from '../lib/appwrite';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import LoadingSpinner from './LoadingSpinner';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

const COLLECTION_ID = COLLECTIONS.WHITEBOARD_OBJECTS;

// Custom Color Picker Component
const ColorPicker = ({ value, onChange, label, className = "" }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-12 h-8 p-1 border-2 ${className}`}
          style={{ backgroundColor: value }}
        >
          <div 
            className="w-full h-full rounded-sm border border-border/20"
            style={{ backgroundColor: value }}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <Label className="text-sm font-medium text-foreground">{label}</Label>
          <div className="space-y-2">
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded border border-border bg-background cursor-pointer"
            />
            <div className="grid grid-cols-8 gap-1">
              {[
                '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
                '#800000', '#808080', '#FFA500', '#800080', '#008000', '#000080', '#FFC0CB', '#A52A2A',
                '#FFD700', '#C0C0C0', '#808000', '#FF6347', '#40E0D0', '#EE82EE', '#90EE90', '#F0E68C'
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => onChange(color)}
                  className={`w-6 h-6 rounded border border-border/20 hover:scale-110 transition-transform ${
                    value === color ? 'ring-2 ring-primary ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'disconnected', 'fallback'

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

    // Setup real-time subscription for this team's whiteboard with retry logic
    let unsubscribe;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout;

    const setupRealtimeSubscription = () => {
      try {
        unsubscribe = client.subscribe(`databases.${import.meta.env.VITE_APPWRITE_DATABASE_ID}.collections.${COLLECTION_ID}.documents`, (response) => {
          if (response.events.includes('databases.*.collections.*.documents.*')) {
            // Don't reload objects if we're currently updating an object locally
            // This prevents real-time updates from interfering with dragging
            if (!isUpdatingObject) {
              loadObjects();
            }
          }
        });
        
        // Reset reconnect attempts on successful connection
        reconnectAttempts = 0;
        setConnectionStatus('connected');
        console.log('✅ Realtime subscription established');
      } catch (error) {
        console.warn('Failed to setup realtime subscription:', error);
        handleRealtimeFailure();
      }
    };

    const handleRealtimeFailure = () => {
      if (reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Exponential backoff, max 30s
        console.warn(`Realtime connection failed. Retrying in ${delay}ms (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
        
        reconnectTimeout = setTimeout(() => {
          setupRealtimeSubscription();
        }, delay);
      } else {
        console.warn('Max reconnection attempts reached. Continuing without realtime updates.');
        setConnectionStatus('disconnected');
        startFallbackRefresh();
        // Continue without realtime updates - whiteboard will still work
      }
    };

    // Initial connection attempt
    setupRealtimeSubscription();

    // Fallback: Periodic refresh when realtime is not working
    let fallbackRefreshInterval;
    const startFallbackRefresh = () => {
      if (fallbackRefreshInterval) return; // Already started
      
      console.log('Starting fallback refresh mechanism (every 10 seconds)');
      setConnectionStatus('fallback');
      fallbackRefreshInterval = setInterval(() => {
        if (!isUpdatingObject) {
          loadObjects();
        }
      }, 10000); // Refresh every 10 seconds
    };

    // Start fallback refresh after a delay to give realtime a chance
    const fallbackTimeout = setTimeout(() => {
      if (reconnectAttempts > 0) {
        startFallbackRefresh();
      }
    }, 15000); // Start fallback after 15 seconds if realtime is still failing

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
    
    // Add wheel event listener with passive: false to allow preventDefault
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (fallbackRefreshInterval) {
        clearInterval(fallbackRefreshInterval);
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (canvas) {
        canvas.removeEventListener('contextmenu', handleContextMenu);
        canvas.removeEventListener('wheel', handleWheel);
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

  // Helper function to compress points data if it's too long
  const compressPointsData = (points) => {
    if (!points) {
      return null;
    }
    
    if (typeof points === 'string') {
      return points;
    }
    
    if (!Array.isArray(points)) {
      return null;
    }
    
    const pointsString = JSON.stringify(points);
    
    // If points data is within limit, return as is
    if (pointsString.length <= 50000) {
      return pointsString;
    }
    
    // If too long, compress by reducing precision and removing unnecessary data
    const compressedPoints = points.map(point => ({
      x: Math.round(point.x * 10) / 10, // Round to 1 decimal place
      y: Math.round(point.y * 10) / 10
    }));
    
    const compressedString = JSON.stringify(compressedPoints);
    
    // If still too long, reduce precision further
    if (compressedString.length > 50000) {
      const moreCompressedPoints = points.map(point => ({
        x: Math.round(point.x), // Round to integers
        y: Math.round(point.y)
      }));
      return JSON.stringify(moreCompressedPoints);
    }
    
    return compressedString;
  };

  // Save object to Appwrite and local state (with team and hackathon context)
  const saveObject = async (objectData) => {
    if (!team?.$id || !hackathonId) return;

    try {
      const objectId = ID.unique();
      
      // Compress points data if it exists and is too long
      let processedObjectData = { ...objectData };
      if (objectData.points) {
        processedObjectData.points = compressPointsData(objectData.points);
      }
      
      const fullObjectData = {
        ...processedObjectData,
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
        } else if (error.message.includes('points') && (error.message.includes('10000') || error.message.includes('50000'))) {
          // If points data is still too long, try with even more compression
          console.warn('Points data still too long, applying maximum compression');
          const maxCompressedData = { ...dataToSave };
          if (maxCompressedData.points) {
            try {
              const points = JSON.parse(maxCompressedData.points);
              if (points && Array.isArray(points)) {
                // Sample every other point to reduce size
                const sampledPoints = points.filter((_, index) => index % 2 === 0);
                maxCompressedData.points = JSON.stringify(sampledPoints);
              }
            } catch (error) {
              console.warn('Error parsing points for maximum compression:', error);
              delete maxCompressedData.points;
            }
          }
          await databases.createDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            objectId,
            maxCompressedData
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

      // Compress points data if it exists and is too long
      let processedUpdates = { ...updates };
      if (updates.points) {
        processedUpdates.points = compressPointsData(updates.points);
      }

      // Update local state immediately for smooth interaction
      setObjects(prevObjects =>
        prevObjects.map(obj =>
          obj.$id === objectId ? { ...obj, ...processedUpdates } : obj
        )
      );

      // Update selected object if it's the one being modified
      if (selectedObject && selectedObject.$id === objectId) {
        setSelectedObject(prev => ({ ...prev, ...processedUpdates }));
      }

      // Update in Appwrite (temporarily handle fillColor gracefully)
      try {
        await databases.updateDocument(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          COLLECTION_ID,
          objectId,
          processedUpdates
        );
      } catch (error) {
        if (error.message.includes('fillColor')) {
          // Retry without fillColor if the attribute doesn't exist
          console.warn('fillColor attribute not found, updating without it. Please update your database schema.');
          const { fillColor, ...updatesWithoutFill } = processedUpdates;
          await databases.updateDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            objectId,
            updatesWithoutFill
          );
        } else if (error.message.includes('points') && (error.message.includes('10000') || error.message.includes('50000'))) {
          // If points data is still too long, try with even more compression
          console.warn('Points data still too long during update, applying maximum compression');
          const maxCompressedUpdates = { ...processedUpdates };
          if (maxCompressedUpdates.points) {
            try {
              const points = JSON.parse(maxCompressedUpdates.points);
              if (points && Array.isArray(points)) {
                // Sample every other point to reduce size
                const sampledPoints = points.filter((_, index) => index % 2 === 0);
                maxCompressedUpdates.points = JSON.stringify(sampledPoints);
              }
            } catch (error) {
              console.warn('Error parsing points for maximum compression during update:', error);
              delete maxCompressedUpdates.points;
            }
          }
          await databases.updateDocument(
            import.meta.env.VITE_APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            objectId,
            maxCompressedUpdates
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

        if (obj.points) {
          try {
            const points = JSON.parse(obj.points);
            if (points && Array.isArray(points) && points.length > 1) {
              ctx.beginPath();
              ctx.moveTo(points[0].x, points[0].y);
              for (let i = 1; i < points.length; i++) {
                ctx.lineTo(points[i].x, points[i].y);
              }
              ctx.stroke();
            }
          } catch (error) {
            console.warn('Error parsing points data:', error);
          }
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
      if (!obj.points) return { x: obj.x || 0, y: obj.y || 0, width: 0, height: 0 };
      
      try {
        const points = JSON.parse(obj.points);
        if (!points || !Array.isArray(points) || points.length === 0) {
          return { x: obj.x || 0, y: obj.y || 0, width: 0, height: 0 };
        }

        const minX = Math.min(...points.map(p => p.x));
        const maxX = Math.max(...points.map(p => p.x));
        const minY = Math.min(...points.map(p => p.y));
        const maxY = Math.max(...points.map(p => p.y));
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
      } catch (error) {
        console.warn('Error parsing points data in getObjectBounds:', error);
        return { x: obj.x || 0, y: obj.y || 0, width: 0, height: 0 };
      }
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
        if (selectedObject.points) {
          try {
            const points = JSON.parse(selectedObject.points);
            if (points && Array.isArray(points)) {
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
            }
          } catch (error) {
            console.warn('Error parsing points data during drag:', error);
          }
        }
        
        // Fallback if points parsing fails
        if (!updateData) {
          updateData = {
            x: selectedObject.x + deltaX,
            y: selectedObject.y + deltaY
          };
        }
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
      <div className="flex items-center justify-center h-screen bg-background">
        <LoadingSpinner message="Loading team whiteboard..." />
      </div>
    );
  }

  // Show message if user doesn't have a team
  if (!team) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Card className="max-w-md">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 mx-auto mb-4 text-muted-foreground">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Team Found</h3>
            <p className="text-muted-foreground mb-4">You need to be part of a team to access the whiteboard.</p>
            <p className="text-sm text-muted-foreground">Go back to the dashboard to create or join a team.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className="relative w-full h-screen overflow-hidden bg-background"
        style={{
          touchAction: 'none', // Prevent touch gestures from interfering
          userSelect: 'none'   // Prevent text selection
        }}
      >
        {/* Connection Status Indicator */}
        <div className="absolute top-4 left-4 z-50 flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
            connectionStatus === 'fallback' ? 'bg-orange-500' :
            'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-600 font-medium">
            {connectionStatus === 'connected' ? 'Live Sync' :
             connectionStatus === 'connecting' ? 'Connecting...' :
             connectionStatus === 'fallback' ? 'Auto-sync (10s)' :
             'Offline Mode'}
          </span>
        </div>
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
      <Card className="absolute top-4 left-4 w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">Drawing Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tool Selection */}
          <div className="grid grid-cols-3 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'select' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('select')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select/Move (V)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('pen')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pen (P)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('eraser')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Eraser (E)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('rectangle')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Rectangle (R)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('circle')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Circle (C)</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={currentTool === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentTool('line')}
                  className="h-10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Line (L)</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Pan Tool */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentTool === 'pan' || isSpacePressed ? 'default' : 'outline'}
                onClick={() => setCurrentTool('pan')}
                className="w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                {isSpacePressed ? '(Space held)' : 'Pan'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Pan (H or Space)</p>
            </TooltipContent>
          </Tooltip>

          <Separator />

          {/* Color Properties */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Stroke Color</Label>
              <ColorPicker
                value={currentColor}
                onChange={setCurrentColor}
                label="Stroke Color"
              />
            </div>

            {(currentTool === 'rectangle' || currentTool === 'circle') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Fill Color</Label>
                  <div className="flex items-center gap-2">
                    <ColorPicker
                      value={fillColor === 'transparent' ? '#ffffff' : fillColor}
                      onChange={(color) => setFillColor(color)}
                      label="Fill Color"
                    />
                    <Button
                      variant={fillColor === 'transparent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFillColor('transparent')}
                      className="text-xs"
                    >
                      None
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Stroke Width</Label>
                <Badge variant="secondary" className="text-xs">
                  {strokeWidth}px
                </Badge>
              </div>
              <Slider
                value={[strokeWidth]}
                onValueChange={(value) => setStrokeWidth(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Image Upload */}
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <Button
              variant="outline"
              asChild
              className="w-full"
            >
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add Image
              </label>
            </Button>
          </div>

          {/* Selected Object Actions */}
          {selectedObject && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">
                    Selected: {selectedObject.type}
                  </Label>
                  <div className="flex gap-1">
                    {isDragging && (
                      <Badge variant="default" className="text-xs">
                        dragging
                      </Badge>
                    )}
                    {isResizing && (
                      <Badge variant="secondary" className="text-xs">
                        resizing
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="destructive"
                  onClick={deleteSelected}
                  className="w-full"
                  size="sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Zoom Controls */}
      <Card className="absolute top-4 right-4 w-20 shadow-lg">
        <CardContent className="p-3 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newZoom = Math.min(5, zoom * 1.2);
                  setZoom(newZoom);
                }}
                className="w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>
          
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {Math.round(zoom * 100)}%
            </Badge>
          </div>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newZoom = Math.max(0.1, zoom * 0.8);
                  setZoom(newZoom);
                }}
                className="w-full"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setZoom(1); setCanvasOffset({ x: 0, y: 0 }); }}
                className="w-full text-xs"
              >
                Reset
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>
        </CardContent>
      </Card>

      {/* Zoom Warning */}
      {showZoomWarning && (
        <Card className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 shadow-lg z-50 border-yellow-500 bg-yellow-500/10">
          <CardContent className="p-4">
            <div className="text-center">
              <div className="font-semibold text-yellow-600 dark:text-yellow-400">Use Mouse Wheel to Zoom</div>
              <div className="text-sm text-yellow-600/80 dark:text-yellow-400/80">Browser zoom is disabled on the whiteboard</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="absolute bottom-4 left-4 w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
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
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <div>• Mouse wheel: Zoom</div>
            <div>• Drag handles: Resize</div>
            <div>• Right-click disabled</div>
          </div>
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
};

export default Whiteboard;