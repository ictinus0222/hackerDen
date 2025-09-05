import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, File, Image, FileText, Code, Archive, Camera } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const FileUpload = ({ 
  onFileUpload, 
  teamId, 
  className,
  disabled = false,
  maxFiles = 10 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const fileInputRef = useRef(null);

  // File type icons mapping
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType === 'application/pdf' || fileType.startsWith('text/')) return FileText;
    if (fileType.includes('javascript') || fileType.includes('css') || fileType.includes('html') || fileType.includes('json')) return Code;
    if (fileType.includes('zip')) return Archive;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file validation
  const validateFiles = (files) => {
    const validFiles = [];
    const errors = [];

    Array.from(files).forEach(file => {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 10MB limit`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'text/plain', 'text/markdown', 'text/csv',
        'application/json', 'text/javascript', 'text/css', 'text/html',
        'application/zip', 'application/x-zip-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  // Handle file upload
  const handleFileUpload = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const { validFiles, errors } = validateFiles(files);

    // Show validation errors
    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // You could show these errors in a toast notification
      return;
    }

    // Check max files limit
    if (validFiles.length > maxFiles) {
      console.error(`Cannot upload more than ${maxFiles} files at once`);
      return;
    }

    // Process each file
    for (const file of validFiles) {
      const fileId = Date.now() + Math.random();
      
      // Add to uploading state
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        progress: 0,
        status: 'uploading'
      }]);

      try {
        // Simulate progress updates (in real implementation, this would come from the upload service)
        const progressInterval = setInterval(() => {
          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, progress: Math.min(f.progress + 10, 90) } : f
          ));
        }, 200);

        // Call the upload handler
        await onFileUpload(file, teamId);

        // Clear progress interval and mark as complete
        clearInterval(progressInterval);
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress: 100, status: 'complete' } : f
        ));

        // Remove from uploading state after a delay
        setTimeout(() => {
          setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
        }, 2000);

      } catch (error) {
        console.error('Upload failed:', error);
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'error', error: error.message } : f
        ));
      }
    }
  }, [onFileUpload, teamId, maxFiles]);

  // Drag and drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  }, [disabled, handleFileUpload]);

  // File input change handler
  const handleFileInputChange = useCallback((e) => {
    const files = e.target.files;
    handleFileUpload(files);
    
    // Reset input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFileUpload]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Open camera for mobile
  const openCamera = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Remove uploading file
  const removeUploadingFile = useCallback((fileId) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  return (
    <div className={cn("w-full", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-all duration-200 cursor-pointer",
          isDragOver && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary/50 hover:bg-muted/50"
        )}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <Upload className={cn(
            "h-10 w-10 mb-4 transition-colors",
            isDragOver && !disabled ? "text-primary" : "text-muted-foreground"
          )} />
          
          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragOver && !disabled ? "Drop files here" : "Upload files"}
            </p>
            <p className="text-xs text-muted-foreground">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supports images, PDFs, text files, code files (max 10MB each)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] touch-manipulation"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                openFileDialog();
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Files
            </Button>
            
            {/* Mobile camera button */}
            <Button 
              variant="outline" 
              size="sm" 
              className="min-h-[44px] touch-manipulation sm:hidden"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                openCamera();
              }}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
        accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.css,.html,.zip"
        disabled={disabled}
      />

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploading Files</h4>
          {uploadingFiles.map((file) => {
            const FileIcon = getFileIcon(file.type);
            
            return (
              <Card key={file.id} className="p-3">
                <div className="flex items-center space-x-3">
                  <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <div className="space-y-1">
                        <Progress value={file.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground">
                          {file.progress}% uploaded
                        </p>
                      </div>
                    )}
                    
                    {file.status === 'complete' && (
                      <p className="text-xs text-green-600">Upload complete</p>
                    )}
                    
                    {file.status === 'error' && (
                      <p className="text-xs text-destructive">
                        Error: {file.error}
                      </p>
                    )}
                  </div>

                  {file.status !== 'complete' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUploadingFile(file.id)}
                      className="h-8 w-8 p-0 min-h-[44px] min-w-[44px] touch-manipulation"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUpload;