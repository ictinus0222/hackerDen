import React, { useState, useEffect, useCallback } from 'react';
import { File } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import FileCard from './FileCard';
import FilePreview from './FilePreview';
import ConfirmationDialog from './ConfirmationDialog';
import fileService from '@/services/fileService';

const FileLibrary = ({ teamId, className }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);

  // Load files
  const loadFiles = useCallback(async () => {
    if (!teamId) return;
    
    try {
      setLoading(true);
      const teamFiles = await fileService.getTeamFiles(teamId);
      setFiles(teamFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Handle file preview
  const handlePreview = useCallback((file) => {
    setSelectedFile(file);
    setPreviewOpen(true);
  }, []);

  // Handle file download
  const handleDownload = useCallback((file) => {
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
  }, []);

  // Handle file deletion confirmation
  const handleDeleteClick = useCallback((file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  }, []);

  // Handle confirmed file deletion
  const handleConfirmDelete = useCallback(async () => {
    if (!fileToDelete) return;
    
    try {
      await fileService.deleteFile(fileToDelete.$id);
      setFiles(prev => prev.filter(f => f.$id !== fileToDelete.$id));
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setFileToDelete(null);
    }
  }, [fileToDelete]);

  // Handle real-time file updates
  const handleFileUpdate = useCallback((response) => {
    const { eventType, payload } = response;
    
    switch (eventType) {
      case 'databases.*.collections.*.documents.*.create':
        setFiles(prev => [payload, ...prev]);
        break;
      case 'databases.*.collections.*.documents.*.update':
        setFiles(prev => prev.map(file => 
          file.$id === payload.$id ? payload : file
        ));
        break;
      case 'databases.*.collections.*.documents.*.delete':
        setFiles(prev => prev.filter(file => file.$id !== payload.$id));
        break;
      default:
        // For other events, reload files to ensure consistency
        loadFiles();
        break;
    }
  }, [loadFiles]);

  // Load files on mount and set up real-time subscription
  useEffect(() => {
    if (teamId) {
      loadFiles();

      // Set up real-time subscription with improved handling
      let unsubscribeFunction = null;
      
      const setupSubscription = async () => {
        try {
          unsubscribeFunction = await fileService.subscribeToFiles(teamId, handleFileUpdate);
        } catch (error) {
          console.error('Failed to set up file subscription:', error);
        }
      };

      setupSubscription();

      return () => {
        if (typeof unsubscribeFunction === 'function') {
          unsubscribeFunction();
        }
      };
    }
  }, [teamId, loadFiles, handleFileUpdate]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Team Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Team Files
            <Badge variant="secondary">{files.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files uploaded yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload files to share with your team
              </p>
            </div>
          ) : (
            <ScrollArea className="h-96">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((file) => (
                  <FileCard
                    key={file.$id}
                    file={file}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* File Preview Dialog */}
      <FilePreview
        file={selectedFile}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete File"
        description={`Are you sure you want to delete "${fileToDelete?.fileName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default FileLibrary;