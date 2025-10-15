/**
 * @fileoverview Team Vault Page Component
 * Combines file management and secrets management in a unified interface
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
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
  Edit3,
  Key,
  Plus,
  EyeOff,
  AlertTriangle,
  Copy,
  ExternalLink
} from 'lucide-react';
import { fileService } from '../services/fileService';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { useVault } from '../hooks/useVault';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';
import VaultSetupNotice from '../components/VaultSetupNotice';

const TeamVaultPage = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { team } = useHackathonTeam(hackathonId);
  
  // File management state
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [newFileName, setNewFileName] = useState('');

  // Vault management state
  const {
    secrets,
    loading: vaultLoading,
    error: vaultError,
    createSecret,
    getSecretValue,
    updateSecret,
    deleteSecret
  } = useVault(team?.$id, hackathonId);

  const [showSecretValue, setShowSecretValue] = useState({});
  const [secretValues, setSecretValues] = useState({});
  const [loadingSecrets, setLoadingSecrets] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState(null);

  // Create secret form state
  const [newSecret, setNewSecret] = useState({
    name: '',
    value: '',
    description: ''
  });

  // Fetch team files
  const fetchFiles = useCallback(async () => {
    if (!team?.$id) return;

    try {
      setFilesLoading(true);
      const teamFiles = await fileService.getTeamFiles(team.$id);
      setFiles(teamFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setFilesLoading(false);
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
  const handleDownloadFile = async (file) => {
    try {
      // Use the simplified download method
      await fileService.downloadFileWithFallback(file.storageId, file.fileName);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  // Vault functions
  const handleCreateSecret = async (e) => {
    e.preventDefault();
    try {
      await createSecret(newSecret.name, newSecret.value, newSecret.description);
      setNewSecret({ name: '', value: '', description: '' });
      setShowCreateForm(false);
      toast.success('Secret created successfully');
    } catch (error) {
      console.error('Failed to create secret:', error);
      toast.error('Failed to create secret');
    }
  };

  const handleViewSecret = async (secretId) => {
    if (loadingSecrets[secretId]) return;
    
    try {
      setLoadingSecrets(prev => ({ ...prev, [secretId]: true }));
      
      if (showSecretValue[secretId] && secretValues[secretId]) {
        // Hide the secret if already showing
        setShowSecretValue(prev => ({ ...prev, [secretId]: false }));
      } else {
        // Fetch and show the secret
        const secretData = await getSecretValue(secretId);
        setSecretValues(prev => ({ ...prev, [secretId]: secretData.value }));
        setShowSecretValue(prev => ({ ...prev, [secretId]: true }));
      }
    } catch (error) {
      console.error('Failed to get secret value:', error);
      toast.error('Failed to retrieve secret');
    } finally {
      setLoadingSecrets(prev => ({ ...prev, [secretId]: false }));
    }
  };

  const handleCopySecret = async (secretId) => {
    try {
      if (!secretValues[secretId]) {
        const secretData = await getSecretValue(secretId);
        await navigator.clipboard.writeText(secretData.value);
      } else {
        await navigator.clipboard.writeText(secretValues[secretId]);
      }
      toast.success('Secret copied to clipboard');
    } catch (error) {
      console.error('Failed to copy secret:', error);
      toast.error('Failed to copy secret');
    }
  };

  const handleEditSecret = (secret) => {
    setEditingSecret({
      id: secret.id,
      name: secret.name,
      value: secretValues[secret.id] || '',
      description: secret.description || ''
    });
  };

  const handleUpdateSecret = async (e) => {
    e.preventDefault();
    if (!editingSecret) return;

    try {
      const updates = {
        name: editingSecret.name,
        description: editingSecret.description
      };
      
      if (editingSecret.value) {
        updates.value = editingSecret.value;
      }

      await updateSecret(editingSecret.id, updates);
      setEditingSecret(null);
      toast.success('Secret updated successfully');
      
      // Clear the stored value if it was updated
      if (editingSecret.value) {
        setSecretValues(prev => ({ ...prev, [editingSecret.id]: editingSecret.value }));
      }
    } catch (error) {
      console.error('Failed to update secret:', error);
      toast.error('Failed to update secret');
    }
  };

  const handleDeleteSecret = async (secretId) => {
    if (window.confirm('Are you sure you want to delete this secret? This action cannot be undone.')) {
      try {
        await deleteSecret(secretId);
        // Clean up local state
        setShowSecretValue(prev => ({ ...prev, [secretId]: false }));
        setSecretValues(prev => {
          const newValues = { ...prev };
          delete newValues[secretId];
          return newValues;
        });
        toast.success('Secret deleted successfully');
      } catch (error) {
        console.error('Failed to delete secret:', error);
        toast.error('Failed to delete secret');
      }
    }
  };

  // Utility functions
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <Image className="h-5 w-5" />;
    } else if (fileType.includes('text') || fileType.includes('json') || fileType.includes('javascript')) {
      return <FileText className="h-5 w-5" />;
    } else {
      return <File className="h-5 w-5" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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

  const isUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
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

  // Check if vault setup is needed
  const shouldShowSetupNotice = vaultError && (vaultError.includes('404') || vaultError.includes('401') || vaultError.includes('collection'));

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Team Vault</h1>
          <p className="text-muted-foreground">
            Secure storage for files and sensitive information
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="files" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <File className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="secrets" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Secrets
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-6">
          {/* Files Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Team Files</h2>
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
          {filesLoading ? (
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
        </TabsContent>

        {/* Secrets Tab */}
        <TabsContent value="secrets" className="space-y-6">
          {/* Secrets Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Team Secrets</h2>
              <p className="text-muted-foreground">
                Store and share API keys, passwords, and important links
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Secret</span>
            </Button>
          </div>

          {/* Vault Setup Notice */}
          {shouldShowSetupNotice && <VaultSetupNotice />}

          {/* Error Display */}
          {vaultError && !shouldShowSetupNotice && (
            <Card className="bg-destructive/10 border-destructive/30 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <p className="text-destructive">{vaultError}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Secrets List */}
          {vaultLoading && secrets.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <LoadingSpinner />
              </CardContent>
            </Card>
          ) : secrets.length === 0 ? (
            <Card>
              <CardContent className="p-16 text-center">
                <Key className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No secrets yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start by adding your first API key, password, or important link.
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Secret
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {secrets.map((secret) => (
                <Card key={secret.id} className="bg-card/95 backdrop-blur-sm border-border/30 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-medium text-foreground">{secret.name}</h3>
                        </div>
                        {secret.description && (
                          <p className="text-muted-foreground text-sm mb-3">{secret.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>Added by {secret.createdByName}</span>
                          <span>•</span>
                          <span>{new Date(secret.createdAt).toLocaleDateString()}</span>
                          {secret.accessCount > 0 && (
                            <>
                              <span>•</span>
                              <span>{secret.accessCount} access{secret.accessCount !== 1 ? 'es' : ''}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewSecret(secret.id)}
                          className="h-8 w-8 p-0"
                          disabled={loadingSecrets[secret.id]}
                        >
                          {loadingSecrets[secret.id] ? (
                            <LoadingSpinner size="sm" showMessage={false} />
                          ) : showSecretValue[secret.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopySecret(secret.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSecret(secret)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSecret(secret.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {showSecretValue[secret.id] && secretValues[secret.id] && (
                      <div className="mt-4 p-3 bg-muted/30 rounded border border-border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-foreground">Value:</span>
                          <div className="flex items-center space-x-2">
                            {isUrl(secretValues[secret.id]) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(secretValues[secret.id], '_blank')}
                                className="h-6 px-2 text-xs"
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Open
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopySecret(secret.id)}
                              className="h-6 px-2 text-xs"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm font-mono text-foreground break-all bg-background/50 p-2 rounded border">
                          {secretValues[secret.id]}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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

      {/* Create Secret Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Secret</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSecret} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newSecret.name}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g., GitHub API Key, Database URL"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Value *
                  </label>
                  <textarea
                    value={newSecret.value}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter the secret value, API key, password, or URL..."
                    rows={3}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newSecret.description}
                    onChange={(e) => setNewSecret(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Optional description or usage notes..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Secret
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Secret Modal */}
      {editingSecret && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Edit Secret</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSecret} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingSecret.name}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Value
                  </label>
                  <textarea
                    value={editingSecret.value}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Leave empty to keep current value"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty to keep the current value unchanged
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editingSecret.description}
                    onChange={(e) => setEditingSecret(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingSecret(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Update Secret
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamVaultPage;
