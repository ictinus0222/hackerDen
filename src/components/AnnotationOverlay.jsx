import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Edit2, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { userNameService } from '@/services/userNameService';
import fileService from '@/services/fileService';

const AnnotationOverlay = ({ 
  file, 
  annotations = [], 
  onAnnotationAdd, 
  onAnnotationUpdate, 
  onAnnotationDelete,
  isReadOnly = false 
}) => {
  const { user } = useAuth();
  const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);
  const [newAnnotationPosition, setNewAnnotationPosition] = useState(null);
  const [newAnnotationContent, setNewAnnotationContent] = useState('');
  const [editingAnnotation, setEditingAnnotation] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [userNames, setUserNames] = useState({});
  const containerRef = useRef(null);

  // Load user names for annotations
  useEffect(() => {
    const loadUserNames = async () => {
      const names = {};
      for (const annotation of annotations) {
        if (!names[annotation.userId]) {
          names[annotation.userId] = await userNameService.getUserName(annotation.userId, user);
        }
      }
      setUserNames(names);
    };

    if (annotations.length > 0) {
      loadUserNames();
    }
  }, [annotations, user]);

  // Handle click on image to add annotation
  const handleImageClick = (event) => {
    if (isReadOnly || !file.fileType.startsWith('image/')) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setNewAnnotationPosition({ x, y });
    setIsAddingAnnotation(true);
  };

  // Save new annotation
  const handleSaveAnnotation = async () => {
    if (!newAnnotationContent.trim() || !newAnnotationPosition) return;

    try {
      const annotationData = {
        content: newAnnotationContent.trim(),
        position: newAnnotationPosition,
        type: 'point'
      };

      await onAnnotationAdd(annotationData);
      
      // Reset state
      setNewAnnotationContent('');
      setNewAnnotationPosition(null);
      setIsAddingAnnotation(false);
    } catch (error) {
      console.error('Error saving annotation:', error);
    }
  };

  // Cancel new annotation
  const handleCancelAnnotation = () => {
    setNewAnnotationContent('');
    setNewAnnotationPosition(null);
    setIsAddingAnnotation(false);
  };

  // Start editing annotation
  const handleEditAnnotation = (annotation) => {
    setEditingAnnotation(annotation.$id);
    setEditContent(annotation.content);
  };

  // Save edited annotation
  const handleSaveEdit = async (annotationId) => {
    if (!editContent.trim()) return;

    try {
      await onAnnotationUpdate(annotationId, { content: editContent.trim() });
      setEditingAnnotation(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating annotation:', error);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingAnnotation(null);
    setEditContent('');
  };

  // Delete annotation
  const handleDeleteAnnotation = async (annotationId) => {
    try {
      await onAnnotationDelete(annotationId);
    } catch (error) {
      console.error('Error deleting annotation:', error);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!file.fileType.startsWith('image/')) {
    // For non-image files, show annotations as a list
    return (
      <div className="mt-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Annotations ({annotations.length})</h4>
          {!isReadOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddingAnnotation(true)}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
          )}
        </div>

        {/* Add new annotation form */}
        {isAddingAnnotation && (
          <div className="mb-4 p-3 border rounded-lg bg-muted/50">
            <Textarea
              placeholder="Add your comment..."
              value={newAnnotationContent}
              onChange={(e) => setNewAnnotationContent(e.target.value)}
              className="mb-2"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelAnnotation}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveAnnotation}
                disabled={!newAnnotationContent.trim()}
              >
                Add Comment
              </Button>
            </div>
          </div>
        )}

        {/* Annotations list */}
        <div className="space-y-3">
          {annotations.map((annotation) => (
            <div key={annotation.$id} className="p-3 border rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {userNames[annotation.userId] || 'Team Member'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(annotation.createdAt)}
                  </span>
                </div>
                {!isReadOnly && user?.$id === annotation.userId && (
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditAnnotation(annotation)}
                      aria-label="Edit annotation"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteAnnotation(annotation.$id)}
                      aria-label="Delete annotation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              
              {editingAnnotation === annotation.$id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(annotation.$id)}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm">{annotation.content}</p>
              )}
            </div>
          ))}
        </div>

        {annotations.length === 0 && !isAddingAnnotation && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No comments yet. {!isReadOnly && 'Click "Add Comment" to start the discussion.'}
          </p>
        )}
      </div>
    );
  }

  // For image files, show annotations as overlay markers
  return (
    <div className="relative" ref={containerRef}>
      <img
        src={fileService.getFileViewUrl(file.storageId)}
        alt={file.fileName}
        className="max-w-full max-h-[60vh] object-contain rounded-lg cursor-crosshair"
        onClick={handleImageClick}
      />

      {/* Existing annotations */}
      {annotations.map((annotation) => (
        <Popover key={annotation.$id}>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="sm"
              className="absolute w-8 h-8 p-0 rounded-full border-2 border-primary"
              style={{
                left: `${annotation.position.x}%`,
                top: `${annotation.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {userNames[annotation.userId] || 'Team Member'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDate(annotation.createdAt)}
                </span>
              </div>
              
              {editingAnnotation === annotation.$id ? (
                <div>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(annotation.$id)}
                      disabled={!editContent.trim()}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm">{annotation.content}</p>
                  {!isReadOnly && user?.$id === annotation.userId && (
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAnnotation(annotation)}
                        aria-label="Edit annotation"
                      >
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAnnotation(annotation.$id)}
                        aria-label="Delete annotation"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </PopoverContent>
        </Popover>
      ))}

      {/* New annotation marker */}
      {isAddingAnnotation && newAnnotationPosition && (
        <Popover open={true}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="absolute w-8 h-8 p-0 rounded-full border-2 border-primary animate-pulse"
              style={{
                left: `${newAnnotationPosition.x}%`,
                top: `${newAnnotationPosition.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Add Annotation</h4>
              <Textarea
                placeholder="Add your comment..."
                value={newAnnotationContent}
                onChange={(e) => setNewAnnotationContent(e.target.value)}
                rows={3}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelAnnotation}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveAnnotation}
                  disabled={!newAnnotationContent.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}

      {/* Instructions */}
      {!isReadOnly && (
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Click on the image to add an annotation
        </p>
      )}
    </div>
  );
};

export default AnnotationOverlay;