import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam.jsx';
import { documentService } from '../services/documentService';
import { versionService } from '../services/versionService';
import MarkdownEditor from '../components/MarkdownEditor';
import DocumentHistory from '../components/DocumentHistory';
import VersionCompare from '../components/VersionCompare';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '../components/ui/resizable';
import { 
  ArrowLeft, 
  Save, 
  Clock, 
  User, 
  Users, 
  Edit3,
  Check,
  X,
  AlertCircle,
  History,
  GitBranch,
  Eye
} from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

const DocumentEditorPage = () => {
  const { hackathonId, documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { team, loading: teamLoading } = useHackathonTeam(hackathonId);
  
  // Document state
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // Editor state
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Version control state
  const [showHistory, setShowHistory] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState([]);
  const [viewingVersion, setViewingVersion] = useState(null);
  const [originalContent, setOriginalContent] = useState('');
  
  // Refs
  const titleInputRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Load document
  const loadDocument = useCallback(async () => {
    if (!documentId || !user?.$id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const doc = await documentService.getDocument(documentId, user.$id);
      if (doc) {
        setDocument(doc);
        setContent(doc.content || '');
        setTitle(doc.title || '');
        setOriginalContent(doc.content || '');
        setLastSaved(new Date(doc.$updatedAt));
        setHasUnsavedChanges(false);
      } else {
        setDocument(null);
      }
    } catch (err) {
      console.error('Error loading document:', err);
      setError(err.message || 'Failed to load document');
    } finally {
      setLoading(false);
    }
  }, [documentId, user?.$id]);

  // Load document on mount
  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  // Auto-save functionality
  const saveDocument = useCallback(async (newContent = content, newTitle = title) => {
    if (!document || !user?.$id || saving) return;
    
    try {
      setSaving(true);
      
      const updates = {};
      let hasChanges = false;
      
      // Check for content changes
      if (newContent !== document.content) {
        updates.content = newContent;
        hasChanges = true;
      }
      
      // Check for title changes
      if (newTitle !== document.title) {
        updates.title = newTitle;
        hasChanges = true;
      }
      
      if (!hasChanges) {
        setSaving(false);
        return;
      }
      
      const updatedDoc = await documentService.updateDocument(
        document.$id,
        updates,
        user.$id,
        user.name
      );
      
      // Create version snapshot if content changed significantly
      if (updates.content && originalContent !== updates.content) {
        try {
          await versionService.createAutoSnapshot(
            document.$id,
            originalContent,
            updates.content,
            user.$id,
            user.name
          );
          setOriginalContent(updates.content);
        } catch (versionError) {
          console.error('Error creating version snapshot:', versionError);
          // Don't fail the save if version creation fails
        }
      }
      
      setDocument(updatedDoc);
      setLastSaved(new Date(updatedDoc.$updatedAt));
      setHasUnsavedChanges(false);
      
      toast.success('Document saved successfully');
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error(err.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  }, [document, content, title, user, saving]);

  // Handle content changes with debounced auto-save
  const handleContentChange = useCallback((newContent) => {
    setContent(newContent);
    setHasUnsavedChanges(true);
    
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set new auto-save timeout
    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(newContent, title);
    }, 2000);
  }, [saveDocument, title]);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle) => {
    setTitle(newTitle);
    setHasUnsavedChanges(true);
  }, []);

  // Handle title save
  const handleTitleSave = useCallback(() => {
    if (title.trim() === '') {
      toast.error('Title cannot be empty');
      setTitle(document?.title || '');
      setIsEditingTitle(false);
      return;
    }
    
    setIsEditingTitle(false);
    
    if (title !== document?.title) {
      saveDocument(content, title.trim());
    }
  }, [title, document, content, saveDocument]);

  // Handle title cancel
  const handleTitleCancel = useCallback(() => {
    setTitle(document?.title || '');
    setIsEditingTitle(false);
  }, [document]);

  // Handle manual save
  const handleManualSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveDocument();
  }, [saveDocument]);

  // Version control handlers
  const handleCreateSnapshot = useCallback(async () => {
    if (!document || !user?.$id) return;
    
    try {
      await versionService.createSnapshot(document.$id, content, {
        createdBy: user.$id,
        createdByName: user.name,
        changesSummary: 'Manual snapshot created',
        isSnapshot: true
      });
      
      toast.success('Snapshot created successfully');
    } catch (err) {
      console.error('Error creating snapshot:', err);
      toast.error(err.message || 'Failed to create snapshot');
    }
  }, [document, content, user]);

  const handleRestoreVersion = useCallback(async (version) => {
    if (!document || !user?.$id) return;
    
    try {
      const updatedDoc = await versionService.restoreVersion(
        document.$id,
        version.$id,
        user.$id,
        user.name
      );
      
      // Update local state
      setContent(version.content);
      setOriginalContent(version.content);
      setDocument(updatedDoc);
      setHasUnsavedChanges(false);
      setLastSaved(new Date(updatedDoc.$updatedAt));
      
      toast.success(`Restored to version ${version.versionNumber}`);
    } catch (err) {
      console.error('Error restoring version:', err);
      toast.error(err.message || 'Failed to restore version');
    }
  }, [document, user]);

  const handleViewVersion = useCallback((version) => {
    setViewingVersion(version);
    setContent(version.content);
  }, []);

  const handleExitVersionView = useCallback(() => {
    if (viewingVersion && document) {
      setViewingVersion(null);
      setContent(document.content || '');
    }
  }, [viewingVersion, document]);

  const handleCompareVersions = useCallback((versionId1, versionId2) => {
    setComparisonVersions([versionId1, versionId2]);
    setShowComparison(true);
    setShowHistory(false);
  }, []);

  const handleCloseComparison = useCallback(() => {
    setShowComparison(false);
    setComparisonVersions([]);
    setShowHistory(true);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Focus title input when editing starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      }
      
      // Escape to cancel title editing
      if (e.key === 'Escape' && isEditingTitle) {
        handleTitleCancel();
      }
      
      // Enter to save title
      if (e.key === 'Enter' && isEditingTitle) {
        handleTitleSave();
      }
    };

    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof document !== 'undefined' && document) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleManualSave, isEditingTitle, handleTitleCancel, handleTitleSave]);

  // Format relative time
  const formatRelativeTime = (date) => {
    if (!date) return '';
    
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString();
  };

  if (teamLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner message="Loading document..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto mb-6 text-red-400">
          <AlertCircle className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Error Loading Document</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={loadDocument}
            variant="outline"
          >
            Try Again
          </Button>
          <Button 
            onClick={() => navigate(`/hackathon/${hackathonId}/documents`)}
          >
            Back to Documents
          </Button>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 px-6">
        <div className="w-16 h-16 mx-auto mb-6 text-muted-foreground">
          <AlertCircle className="w-full h-full" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">Document Not Found</h3>
        <p className="text-muted-foreground mb-6">
          The document you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button 
          onClick={() => navigate(`/hackathon/${hackathonId}/documents`)}
        >
          Back to Documents
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Navigation and title */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/hackathon/${hackathonId}/documents`)}
                className="flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Documents
              </Button>
              
              <Separator orientation="vertical" className="h-6" />
              
              {/* Title editing */}
              <div className="flex-1 min-w-0">
                {isEditingTitle ? (
                  <div className="flex items-center space-x-2">
                    <Input
                      ref={titleInputRef}
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="text-lg font-semibold"
                      placeholder="Document title..."
                    />
                    <Button
                      size="sm"
                      onClick={handleTitleSave}
                      disabled={!title.trim()}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleTitleCancel}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="text-left text-lg font-semibold text-foreground hover:text-primary transition-colors truncate"
                    title={document.title}
                  >
                    {document.title}
                    <Edit3 className="w-4 h-4 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right side - Actions and status */}
            <div className="flex items-center space-x-4 flex-shrink-0">
              {/* Save status */}
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <Clock className="w-4 h-4" />
                    <span>Unsaved changes</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span>Saved {formatRelativeTime(lastSaved)}</span>
                  </>
                ) : null}
              </div>
              
              {/* Version control buttons */}
              {viewingVersion && (
                <Button
                  onClick={handleExitVersionView}
                  variant="outline"
                  size="sm"
                  className="flex-shrink-0"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Exit Preview
                </Button>
              )}
              
              <Button
                onClick={handleCreateSnapshot}
                disabled={saving || !document}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Snapshot
              </Button>
              
              <Button
                onClick={() => setShowHistory(!showHistory)}
                variant="outline"
                size="sm"
                className="flex-shrink-0"
              >
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
              
              {/* Manual save button */}
              <Button
                onClick={handleManualSave}
                disabled={saving || !hasUnsavedChanges || viewingVersion}
                size="sm"
                className="flex-shrink-0"
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
          
          {/* Document metadata */}
          <div className="flex items-center space-x-4 mt-3 text-sm text-muted-foreground">
            {viewingVersion ? (
              <div className="flex items-center space-x-1 text-amber-600 dark:text-amber-400">
                <Eye className="w-4 h-4" />
                <span>Viewing version {viewingVersion.versionNumber} (read-only)</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(viewingVersion.$createdAt).toLocaleString()}
                </Badge>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>Created by {document.createdByName}</span>
                </div>
                
                {document.collaborators && document.collaborators.length > 1 && (
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{document.collaborators.length} collaborators</span>
                  </div>
                )}
                
                {document.tags && document.tags.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span>Tags:</span>
                    <div className="flex space-x-1">
                      {document.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Editor with optional history/comparison panels */}
      <div className="flex-1 min-h-0">
        {showComparison ? (
          <VersionCompare
            versionId1={comparisonVersions[0]}
            versionId2={comparisonVersions[1]}
            onClose={handleCloseComparison}
            className="h-full"
          />
        ) : showHistory ? (
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={70} minSize={50}>
              <MarkdownEditor
                value={content}
                onChange={viewingVersion ? undefined : handleContentChange}
                placeholder="Start writing your document..."
                autoSave={false}
                className="h-full border-0 rounded-none"
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={30} minSize={25}>
              <DocumentHistory
                documentId={documentId}
                onRestoreVersion={handleRestoreVersion}
                onViewVersion={handleViewVersion}
                onCompareVersions={handleCompareVersions}
                className="h-full border-l"
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <MarkdownEditor
            value={content}
            onChange={viewingVersion ? undefined : handleContentChange}
            placeholder="Start writing your document..."
            autoSave={false}
            className="h-full border-0 rounded-none"
          />
        )}
      </div>
    </div>
  );
};

export default DocumentEditorPage;