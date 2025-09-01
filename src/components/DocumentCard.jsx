import { memo, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardHeader, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';

const DocumentCard = memo(({
  document,
  onEdit,
  onDelete,
  onView,
  'aria-posinset': ariaPosinset,
  'aria-setsize': ariaSetsize
}) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCardClick = useCallback(() => {
    if (onView) {
      onView(document);
    }
  }, [document, onView]);

  const getContentPreview = (content) => {
    if (!content) return 'No content yet...';
    // Remove markdown syntax for preview
    const plainText = content
      .replace(/#{1,6}\s+/g, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
      .trim();
    
    return plainText.length > 120 ? plainText.substring(0, 120) + '...' : plainText;
  };

  const getCollaboratorCount = () => {
    return document.collaborators ? document.collaborators.length : 1;
  };

  return (
    <Card
      variant="enhanced"
      className="group cursor-pointer select-none min-h-[200px] border-l-4 border-l-primary/80 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-xl transition-all duration-300"
      tabIndex="0"
      role="button"
      aria-label={`Document: ${document.title}. Created by ${document.createdByName}. ${document.content ? `Preview: ${getContentPreview(document.content)}` : 'No content yet'}`}
      aria-describedby={`document-${document.$id}-details`}
      aria-posinset={ariaPosinset}
      aria-setsize={ariaSetsize}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-foreground text-base leading-relaxed flex-1 pr-2 line-clamp-2">
            {document.title}
          </h4>
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onEdit) {
                  onEdit(document);
                }
              }}
              className="h-8 w-8 p-1 hover:bg-blue-500/20 text-muted-foreground hover:text-blue-400 hover:scale-110"
              aria-label={`Edit document: ${document.title}`}
              title="Edit document"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (onDelete) {
                  onDelete(document.$id);
                }
              }}
              className="h-8 w-8 p-1 hover:bg-destructive/20 text-muted-foreground hover:text-destructive hover:scale-110"
              aria-label={`Delete document: ${document.title}`}
              title="Delete document"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-xs font-bold text-primary-foreground">
                {document.createdByName?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {document.createdByName}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {getCollaboratorCount() > 1 && (
              <div className="flex items-center space-x-1">
                <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-xs text-muted-foreground font-mono">
                  {getCollaboratorCount()}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Content Preview */}
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {getContentPreview(document.content)}
        </p>

        {/* Tags */}
        {document.tags && Array.isArray(document.tags) && document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {document.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                {tag}
              </Badge>
            ))}
            {document.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{document.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Document Stats */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-muted-foreground">
                v{document.contentVersion || 1}
              </span>
            </div>
            
            {document.permissions?.visibility && (
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {document.permissions.visibility === 'team' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  ) : document.permissions.visibility === 'leaders' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
                <span className="text-muted-foreground capitalize">
                  {document.permissions.visibility}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter
        id={`document-${document.$id}-details`}
        className="flex items-center justify-between text-xs pt-3"
      >
        <time
          dateTime={document.$createdAt || document.createdAt}
          className="text-muted-foreground text-xs font-mono"
          title={`Created on ${new Date(document.$createdAt || document.createdAt).toLocaleString()}`}
        >
          {formatDate(document.$createdAt || document.createdAt)}
        </time>
        
        <div className="flex items-center space-x-2">
          {(document.$updatedAt || document.updatedAt) !== (document.$createdAt || document.createdAt) && (
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" title="Recently updated"></div>
          )}
          <time
            dateTime={document.$updatedAt || document.updatedAt}
            className="text-muted-foreground text-xs font-mono"
            title={`Last modified on ${new Date(document.$updatedAt || document.updatedAt).toLocaleString()}`}
          >
            Modified {formatDate(document.$updatedAt || document.updatedAt)}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
});

DocumentCard.displayName = 'DocumentCard';

export default DocumentCard;