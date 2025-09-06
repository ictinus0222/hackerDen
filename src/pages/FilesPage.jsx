/**
 * @fileoverview Files Page Component
 * Displays team files with upload, download, and annotation functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Image, 
  File, 
  Calendar,
  User,
  Edit3
} from 'lucide-react';
import { fileService } from '../services/fileService';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const FilesPage = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { team } = useHackathonTeam(hackathonId);
  
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  // Fetch team files
  const fetchFiles = useCallback(async () => {
    if (!team?.$id) return;

    try {
      setLoading(true);
      const teamFiles = await fileService.getTeamFiles(team.$id);
      setFiles(teamFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [team?.$id]);

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !team?.$id || !user?.$id) return;

    try {
      setUploading(true);
      await fileService.uploadFile(team.$id, file, user.$id);
      toast.success('File uploaded successfully!');
      await fetchFiles(); // Refresh file list
      
      // Clear the input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  // Handle file deletion
  const handleDeleteFile = async (fileId) => {
    if (!user?.$id) return;

    try {
      await fileService.deleteFile(fileId, user.$id);
      toast.success('File deleted successfully');
      await fetchFiles(); // Refresh file list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  // Handle edit file name
  const handleEditFileName = (file) => {
    setEditingFile(file);
    setNewFileName(file.fileName);
  };

  // Save file name
  const handleSaveFileName = async () => {
    if (!editingFile || !newFileName.trim()) return;

    try {
      await fileService.updateFileName(editingFile.$id, newFileName.trim());
      toast.success('File name updated successfully');
      setEditingFile(null);
      setNewFileName('');
      await fetchFiles(); // Refresh file list
    } catch (error) {
      console.error('Error updating file name:', error);
      toast.error('Failed to update file name');
    }
  };

  // Handle file preview
  const handlePreviewFile = (file) => {
    if (file.fileType.startsWith('image/')) {
      // For images, open in a new window with proper preview
      const viewUrl = fileService.getFileViewUrl(file.storageId);
      window.open(viewUrl, '_blank');
    } else {
      // For other files, attempt to view or download
      try {
        const viewUrl = fileService.getFileViewUrl(file.storageId);
        window.open(viewUrl, '_blank');
      } catch (error) {
        console.error('Preview failed, attempting download:', error);
        handleDownloadFile(file);
      }
    }
  };

  // Handle file download
  const handleDownloadFile = (file) => {
    try {
      const downloadUrl = fileService.getFileDownloadUrl(file.storageId);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (fileType.includes('text') || fileType.includes('json') || fileType.includes('javascript')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
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

  // Get file type badge color
  const getFileTypeBadge = (fileType) => {
    if (fileType.startsWith('image/')) {
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    } else if (fileType.includes('text') || fileType.includes('json')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    } else if (fileType.includes('pdf')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    } else {
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Subscribe to real-time file updates
  useEffect(() => {
    if (!team?.$id) return;

    const unsubscribe = fileService.subscribeToFiles(team.$id, (response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create') ||
          response.events.includes('databases.*.collections.*.documents.*.delete')) {
        fetchFiles();
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [team?.$id, fetchFiles]);

  if (!team) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Loading team information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Files</h1>
          <p className="text-muted-foreground">
            Share and manage files with your team
          </p>
        </div>
        
        {/* Upload Button */}
        <div className="flex items-center gap-2">
          <Input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
            accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.md,.csv,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.zip,.tar,.gz"
          />
          <Button
            asChild
            disabled={uploading}
            className="cursor-pointer"
          >
            <label htmlFor="file-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </label>
          </Button>
        </div>
      </div>

      {/* Files Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No files yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first file to get started sharing with your team
            </p>
            <Button
              asChild
              className="cursor-pointer"
            >
              <label htmlFor="file-upload-empty" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload First File
              </label>
            </Button>
            <Input
              type="file"
              id="file-upload-empty"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
              accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.txt,.md,.csv,.json,.js,.ts,.jsx,.tsx,.css,.html,.xml,.zip,.tar,.gz"
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <Card key={file.$id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {getFileIcon(file.fileType)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm truncate" title={file.fileName}>
                        {file.fileName}
                      </CardTitle>
                    </div>
                  </div>
                  <Badge className={`text-xs ${getFileTypeBadge(file.fileType)}`}>
                    {file.fileType.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-3">
                {/* File Preview */}
                {file.previewUrl && file.fileType.startsWith('image/') && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img
                      src={file.previewUrl}
                      alt={file.fileName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* File Info */}
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span>Uploaded by {file.uploaderName || 'Team Member'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePreviewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Preview File</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadFile(file)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Download File</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditFileName(file)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit Name</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {file.uploadedBy === user?.$id && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteFile(file.$id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete File</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit File Name Dialog */}
      <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit File Name</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="fileName" className="block text-sm font-medium mb-2">
                File Name
              </label>
              <Input
                id="fileName"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new file name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFile(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFileName} disabled={!newFileName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilesPage;