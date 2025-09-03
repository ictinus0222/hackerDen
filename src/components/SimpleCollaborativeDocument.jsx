import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { simpleDocumentService } from '../services/simpleDocumentService';

import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertCircle, Save, Users, Clock } from 'lucide-react';

const SimpleCollaborativeDocument = () => {
  const { hackathonId } = useParams();
  // TODO: Authentication removed
  // // TODO: Authentication removed
  // const { user, ... } = useAuth();
  const { team } = useHackathonTeam(hackathonId);
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Load document on component mount
  useEffect(() => {
    if (team && hackathonId) {
      loadDocument();
    }
  }, [team, hackathonId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      const doc = await simpleDocumentService.getTeamDocument(team.$id, hackathonId);
      setDocument(doc);
      setContent(doc.content || '');
      setTitle(doc.title || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced save function
  const saveDocument = useCallback(async (newContent, newTitle) => {
    if (!document) return;

    try {
      setSaving(true);
      const updatedDoc = await simpleDocumentService.updateDocument(
        document.$id,
        newContent,
        newTitle
      );
      setDocument(updatedDoc);
    } catch (err) {
      setError('Failed to save document');
    } finally {
      setSaving(false);
    }
  }, [document]);

  // Auto-save with debounce
  useEffect(() => {
    if (!document || loading) return;

    const timeoutId = setTimeout(() => {
      if (content !== document.content || title !== document.title) {
        saveDocument(content, title);
      }
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, title, document, loading, saveDocument]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  if (loading || !team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading document...</div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <div className="text-muted-foreground mb-4">{error}</div>
          <Button onClick={loadDocument} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="pb-3">
          <Input
            type="text"
            value={title}
            onChange={handleTitleChange}
            className="text-2xl font-bold border-none shadow-none p-0 h-auto bg-transparent focus-visible:ring-0"
            placeholder="Document title..."
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Team: {team?.name}</span>
            </div>
            <div className="flex items-center gap-4">
              {saving && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Save className="h-3 w-3" />
                  Saving...
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>
                  {document?.$updatedAt 
                    ? new Date(document.$updatedAt).toLocaleString() 
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Editor Card */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Collaborative Editor</h3>
            <Badge variant="outline" className="text-xs">
              Markdown Supported
            </Badge>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-0">
          <Textarea
            value={content}
            onChange={handleContentChange}
            className="min-h-[500px] border-none shadow-none resize-none font-mono text-sm focus-visible:ring-0 rounded-none"
            placeholder="Start writing your collaborative document here...

# Welcome to your team document!

You can use **markdown** formatting:
- Lists
- **Bold text**
- *Italic text*
- `Code blocks`

Start collaborating with your team!"
          />
        </CardContent>
      </Card>

      {/* Footer */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-xs text-muted-foreground text-center">
            💡 Changes are automatically saved every 2 seconds. This document is shared with all team members in real-time.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleCollaborativeDocument;