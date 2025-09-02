import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  GitBranch, 
  RotateCcw, 
  Eye, 
  GitCompare,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { versionService } from '../services/versionService';
import { cn } from '../lib/utils';

const DocumentHistory = ({ 
  documentId, 
  onRestoreVersion, 
  onViewVersion, 
  onCompareVersions,
  className 
}) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVersions, setSelectedVersions] = useState([]);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState(null);
  const [restoring, setRestoring] = useState(false);

  // Load version history
  useEffect(() => {
    if (documentId) {
      loadVersionHistory();
    }
  }, [documentId]);

  const loadVersionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const versionHistory = await versionService.getVersionHistory(documentId, {
        limit: 50
      });
      
      setVersions(versionHistory);
    } catch (err) {
      console.error('Error loading version history:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (version) => {
    if (selectedVersions.includes(version.$id)) {
      setSelectedVersions(selectedVersions.filter(id => id !== version.$id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions([...selectedVersions, version.$id]);
    } else {
      // Replace the oldest selection
      setSelectedVersions([selectedVersions[1], version.$id]);
    }
  };

  const handleCompareVersions = () => {
    if (selectedVersions.length === 2 && onCompareVersions) {
      onCompareVersions(selectedVersions[0], selectedVersions[1]);
    }
  };

  const handleRestoreClick = (version) => {
    setVersionToRestore(version);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!versionToRestore || !onRestoreVersion) return;
    
    try {
      setRestoring(true);
      await onRestoreVersion(versionToRestore);
      setRestoreDialogOpen(false);
      setVersionToRestore(null);
      // Reload history to show the new restoration version
      await loadVersionHistory();
    } catch (err) {
      console.error('Error restoring version:', err);
      setError(err.message);
    } finally {
      setRestoring(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted-foreground">Loading version history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load version history: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold">Version History</h3>
              <Badge variant="secondary">{versions.length} versions</Badge>
            </div>
            
            {selectedVersions.length === 2 && (
              <Button
                onClick={handleCompareVersions}
                size="sm"
                variant="outline"
                className="gap-2"
              >
                <GitCompare className="h-4 w-4" />
                Compare Selected
              </Button>
            )}
          </div>
          
          {selectedVersions.length > 0 && (
            <div className="mt-2 text-sm text-muted-foreground">
              {selectedVersions.length === 1 
                ? 'Select another version to compare' 
                : 'Two versions selected for comparison'
              }
            </div>
          )}
        </div>

        {/* Version List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {versions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No version history available</p>
                <p className="text-sm">Versions will appear here as the document is edited</p>
              </div>
            ) : (
              versions.map((version, index) => (
                <Card 
                  key={version.$id} 
                  className={cn(
                    'cursor-pointer transition-colors hover:bg-muted/50',
                    selectedVersions.includes(version.$id) && 'ring-2 ring-primary'
                  )}
                  onClick={() => handleVersionSelect(version)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {/* Version Header */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge 
                            variant={version.isSnapshot ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {version.isSnapshot ? (
                              <>
                                <GitBranch className="h-3 w-3 mr-1" />
                                Snapshot
                              </>
                            ) : (
                              `v${version.versionNumber}`
                            )}
                          </Badge>
                          
                          {index === 0 && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                          
                          <span className="text-xs text-muted-foreground">
                            {formatDate(version.$createdAt)}
                          </span>
                        </div>

                        {/* Changes Summary */}
                        <p className="text-sm font-medium mb-1">
                          {version.changesSummary}
                        </p>

                        {/* Author and Time */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.createdByName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatTime(version.$createdAt)}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 ml-4">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewVersion && onViewVersion(version);
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View this version</TooltipContent>
                        </Tooltip>

                        {index > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRestoreClick(version);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Restore to this version</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Restore Confirmation Dialog */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Restore Document Version</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This will restore the document to version {versionToRestore?.versionNumber}. 
                  The current content will be backed up automatically before restoration.
                </AlertDescription>
              </Alert>

              {versionToRestore && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm font-medium mb-1">
                    Version {versionToRestore.versionNumber}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {versionToRestore.changesSummary}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created by {versionToRestore.createdByName} on{' '}
                    {new Date(versionToRestore.$createdAt).toLocaleString()}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setRestoreDialogOpen(false)}
                  disabled={restoring}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRestoreConfirm}
                  disabled={restoring}
                  className="gap-2"
                >
                  {restoring ? (
                    <>
                      <LoadingSpinner className="h-4 w-4" />
                      Restoring...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Restore Version
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default DocumentHistory;