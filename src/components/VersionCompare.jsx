import React, { useState, useEffect } from 'react';
import { 
  GitCompare, 
  ArrowLeft, 
  ArrowRight, 
  Calendar, 
  User, 
  FileText,
  Plus,
  Minus,
  Equal,
  AlertCircle
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import LoadingSpinner from './LoadingSpinner';
import { versionService } from '../services/versionService';
import { cn } from '../lib/utils';

const VersionCompare = ({ 
  versionId1, 
  versionId2, 
  onClose,
  className 
}) => {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'unified'

  useEffect(() => {
    if (versionId1 && versionId2) {
      loadComparison();
    }
  }, [versionId1, versionId2]);

  const loadComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const comparisonResult = await versionService.compareVersions(versionId1, versionId2);
      setComparison(comparisonResult);
    } catch (err) {
      console.error('Error loading version comparison:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const renderDiffLine = (line, index) => {
    const getLineClass = (type) => {
      switch (type) {
        case 'added':
          return 'bg-green-50 border-l-4 border-l-green-500 dark:bg-green-950/20';
        case 'removed':
          return 'bg-red-50 border-l-4 border-l-red-500 dark:bg-red-950/20';
        case 'modified':
          return 'bg-yellow-50 border-l-4 border-l-yellow-500 dark:bg-yellow-950/20';
        default:
          return 'bg-background';
      }
    };

    const getLineIcon = (type) => {
      switch (type) {
        case 'added':
          return <Plus className="h-3 w-3 text-green-600" />;
        case 'removed':
          return <Minus className="h-3 w-3 text-red-600" />;
        default:
          return <Equal className="h-3 w-3 text-muted-foreground" />;
      }
    };

    return (
      <div
        key={index}
        className={cn(
          'flex items-start gap-2 px-3 py-1 text-sm font-mono',
          getLineClass(line.type)
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
          {getLineIcon(line.type)}
          <span className="text-xs text-muted-foreground w-8 text-right">
            {line.oldLineNumber || ''}
          </span>
          <span className="text-xs text-muted-foreground w-8 text-right">
            {line.newLineNumber || ''}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <code className="whitespace-pre-wrap break-words">
            {line.content || ' '}
          </code>
        </div>
      </div>
    );
  };

  const renderSideBySideView = () => {
    if (!comparison) return null;

    const { version1, version2, diff } = comparison;
    const oldLines = version1.content.split('\n');
    const newLines = version2.content.split('\n');

    return (
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Left Panel - Older Version */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Version {version1.versionNumber} (Older)
              </CardTitle>
              <Badge variant="outline">
                {oldLines.length} lines
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {version1.createdByName} • {formatDate(version1.$createdAt)}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-3">
                {oldLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 px-2 py-1 text-sm font-mono hover:bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
                      {index + 1}
                    </span>
                    <code className="whitespace-pre-wrap break-words">
                      {line || ' '}
                    </code>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Right Panel - Newer Version */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Version {version2.versionNumber} (Newer)
              </CardTitle>
              <Badge variant="outline">
                {newLines.length} lines
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              {version2.createdByName} • {formatDate(version2.$createdAt)}
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-full">
              <div className="p-3">
                {newLines.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 px-2 py-1 text-sm font-mono hover:bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground w-8 text-right flex-shrink-0">
                      {index + 1}
                    </span>
                    <code className="whitespace-pre-wrap break-words">
                      {line || ' '}
                    </code>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderUnifiedView = () => {
    if (!comparison) return null;

    const { diff } = comparison;

    return (
      <Card className="flex flex-col h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Unified Diff View</CardTitle>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-green-600" />
              <span>{comparison.summary.linesAdded} added</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-red-600" />
              <span>{comparison.summary.linesRemoved} removed</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ScrollArea className="h-full">
            <div className="border-t">
              {diff.map((line, index) => renderDiffLine(line, index))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner />
        <span className="ml-2 text-sm text-muted-foreground">Loading comparison...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load version comparison: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!comparison) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        <FileText className="h-12 w-12 mb-4 opacity-50" />
        <p>No comparison data available</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Version Comparison</h3>
          </div>
          
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Button>
          )}
        </div>

        {/* Version Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline">v{comparison.version1.versionNumber}</Badge>
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">v{comparison.version2.versionNumber}</Badge>
          </div>
          
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Plus className="h-3 w-3 text-green-600" />
              <span>{comparison.summary.linesAdded}</span>
            </div>
            <div className="flex items-center gap-1">
              <Minus className="h-3 w-3 text-red-600" />
              <span>{comparison.summary.linesRemoved}</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={viewMode} onValueChange={setViewMode}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
            <TabsTrigger value="unified">Unified Diff</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-h-0">
        {viewMode === 'side-by-side' ? renderSideBySideView() : renderUnifiedView()}
      </div>
    </div>
  );
};

export default VersionCompare;