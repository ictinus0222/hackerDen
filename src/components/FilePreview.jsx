import React, { useState, useEffect } from 'react';
import { File, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import fileService from '@/services/fileService';
import AnnotationOverlay from './AnnotationOverlay';

const FilePreview = ({ file, open, onOpenChange }) => {
  const { user } = useAuth();
  const [annotations, setAnnotations] = useState([]);
  const [loading, setLoading] = useState(false);
  // Load annotations when file changes
  useEffect(() => {
    const loadAnnotations = async () => {
      if (!file?.$id) return;
      
      setLoading(true);
      try {
        const fileAnnotations = await fileService.getFileAnnotations(file.$id);
        setAnnotations(fileAnnotations);
      } catch (error) {
        console.error('Error loading annotations:', error);
        setAnnotations([]);
      } finally {
        setLoading(false);
      }
    };

    if (open && file) {
      loadAnnotations();
    }
  }, [file, open]);

  // Subscribe to real-time annotation updates
  useEffect(() => {
    if (!open || !file?.$id) return;

    let unsubscribe;

    const setupSubscription = async () => {
      try {
        unsubscribe = await fileService.subscribeToAnnotations(
          file.$id,
          (response) => {
            console.log('🔔 Annotation update received:', response);
            
            const { events, payload } = response;
            
            if (events.includes('databases.*.collections.*.documents.*.create')) {
              // New annotation added
              setAnnotations(prev => {
                const exists = prev.some(ann => ann.$id === payload.$id);
                if (!exists) {
                  return [...prev, payload];
                }
                return prev;
              });
            } else if (events.includes('databases.*.collections.*.documents.*.update')) {
              // Annotation updated
              setAnnotations(prev => 
                prev.map(ann => ann.$id === payload.$id ? payload : ann)
              );
            } else if (events.includes('databases.*.collections.*.documents.*.delete')) {
              // Annotation deleted
              setAnnotations(prev => 
                prev.filter(ann => ann.$id !== payload.$id)
              );
            }
          }
        );
      } catch (error) {
        console.error('Error setting up annotation subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [open, file?.$id]);

  // Handle adding new annotation
  const handleAnnotationAdd = async (annotationData) => {
    if (!file?.$id || !user?.$id) return;

    try {
      const newAnnotation = await fileService.addAnnotation(file.$id, user.$id, annotationData);
      setAnnotations(prev => [...prev, newAnnotation]);
    } catch (error) {
      console.error('Error adding annotation:', error);
      throw error;
    }
  };

  // Handle updating annotation
  const handleAnnotationUpdate = async (annotationId, updates) => {
    try {
      const updatedAnnotation = await fileService.updateAnnotation(annotationId, updates);
      setAnnotations(prev => 
        prev.map(ann => ann.$id === annotationId ? updatedAnnotation : ann)
      );
    } catch (error) {
      console.error('Error updating annotation:', error);
      throw error;
    }
  };

  // Handle deleting annotation
  const handleAnnotationDelete = async (annotationId) => {
    try {
      await fileService.deleteAnnotation(annotationId);
      setAnnotations(prev => prev.filter(ann => ann.$id !== annotationId));
    } catch (error) {
      console.error('Error deleting annotation:', error);
      throw error;
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Handle file download
  const handleDownload = () => {
    if (!file) return;
    
    try {
      const downloadUrl = fileService.getFileDownloadUrl(file.storageId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  if (!file) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{file.fileName}</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {file.fileType.startsWith('image/') ? (
            <div className="flex justify-center">
              <AnnotationOverlay
                file={file}
                annotations={annotations}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
                isReadOnly={false}
              />
            </div>
          ) : file.fileType === 'application/pdf' ? (
            <div>
              <div className="w-full h-[60vh] border rounded-lg mb-4">
                <iframe
                  src={fileService.getFileViewUrl(file.storageId)}
                  className="w-full h-full rounded-lg"
                  title={file.fileName}
                />
              </div>
              <AnnotationOverlay
                file={file}
                annotations={annotations}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
                isReadOnly={false}
              />
            </div>
          ) : file.fileType.startsWith('text/') ? (
            <div>
              <div className="bg-muted p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Text file preview not available. Download to view contents.
                </p>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
              <AnnotationOverlay
                file={file}
                annotations={annotations}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
                isReadOnly={false}
              />
            </div>
          ) : (
            <div>
              <div className="bg-muted p-4 rounded-lg text-center mb-4">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Preview not available for this file type
                </p>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
              <AnnotationOverlay
                file={file}
                annotations={annotations}
                onAnnotationAdd={handleAnnotationAdd}
                onAnnotationUpdate={handleAnnotationUpdate}
                onAnnotationDelete={handleAnnotationDelete}
                isReadOnly={false}
              />
            </div>
          )}
          
          {/* File metadata */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-medium">Size</p>
                <p className="text-muted-foreground">{formatFileSize(file.fileSize)}</p>
              </div>
              <div>
                <p className="font-medium">Type</p>
                <p className="text-muted-foreground">{file.fileType}</p>
              </div>
              <div>
                <p className="font-medium">Uploaded</p>
                <p className="text-muted-foreground">{formatDate(file.createdAt)}</p>
              </div>
              <div>
                <p className="font-medium">Annotations</p>
                <p className="text-muted-foreground">{annotations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FilePreview;