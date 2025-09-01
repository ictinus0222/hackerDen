import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { documentService } from '../services/documentService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { SearchInput } from './ui/search-input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import LoadingSpinner from './LoadingSpinner';
import DocumentCard from './DocumentCard';
import DocumentCreateModal from './DocumentCreateModal';

const DocumentList = ({ teamId, hackathonId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    tag: 'all',
    author: 'all',
    sortBy: 'modified'
  });
  
  // Advanced filter toggle
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!teamId || !hackathonId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const result = await documentService.getTeamDocuments(teamId, hackathonId, {
        includeArchived: false,
        limit: 100
      });
      
      setDocuments(result.documents || []);
    } catch (err) {
      console.error('Error loading documents:', err);
      setError(err.message || 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [teamId, hackathonId]);

  // Load documents on mount and when dependencies change
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Get unique tags and authors for filters
  const { uniqueTags, uniqueAuthors } = useMemo(() => {
    const tags = new Set();
    const authors = new Set();
    
    documents.forEach(doc => {
      if (doc.tags) {
        doc.tags.forEach(tag => tags.add(tag));
      }
      if (doc.createdByName) {
        authors.add(doc.createdByName);
      }
    });
    
    return {
      uniqueTags: Array.from(tags).sort(),
      uniqueAuthors: Array.from(authors).sort()
    };
  }, [documents]);

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.content.toLowerCase().includes(searchTerm) ||
        doc.createdByName.toLowerCase().includes(searchTerm) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
      );
    }

    // Apply tag filter
    if (filters.tag !== 'all') {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.includes(filters.tag)
      );
    }

    // Apply author filter
    if (filters.author !== 'all') {
      if (filters.author === 'me') {
        filtered = filtered.filter(doc => doc.createdBy === user?.$id);
      } else {
        filtered = filtered.filter(doc => doc.createdByName === filters.author);
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'created':
          return new Date(b.$createdAt || b.createdAt) - new Date(a.$createdAt || a.createdAt);
        case 'modified':
        default:
          return new Date(b.$updatedAt || b.updatedAt) - new Date(a.$updatedAt || a.updatedAt);
      }
    });

    return filtered;
  }, [documents, filters, user?.$id]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      tag: 'all',
      author: 'all',
      sortBy: 'modified'
    });
  };

  // Handle document creation
  const handleDocumentCreated = async (documentData, editDoc = null) => {
    try {
      if (editDoc) {
        // Update existing document
        const updatedDoc = await documentService.updateDocument(
          editDoc.$id,
          documentData,
          user.$id,
          user.name
        );
        
        setDocuments(prev => 
          prev.map(doc => doc.$id === editDoc.$id ? updatedDoc : doc)
        );
        setEditingDocument(null);
      } else {
        // Create new document
        const newDoc = await documentService.createDocument(
          teamId,
          hackathonId,
          {
            ...documentData,
            createdBy: user.$id,
            createdByName: user.name
          }
        );
        
        setDocuments(prev => [newDoc, ...prev]);
      }
    } catch (error) {
      console.error('Error saving document:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  // Handle document deletion
  const handleDocumentDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId, user.$id);
      setDocuments(prev => prev.filter(doc => doc.$id !== documentId));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.message || 'Failed to delete document');
    }
  };

  // Handle document edit
  const handleDocumentEdit = (document) => {
    setEditingDocument(document);
    setIsCreateModalOpen(true);
  };

  // Handle document view
  const handleDocumentView = (document) => {
    // Navigate to document editor page
    navigate(`/hackathon/${hackathonId}/documents/${document.$id}`);
  };

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(
    (value, index) => {
      const keys = Object.keys(filters);
      const key = keys[index];
      return key !== 'search' && key !== 'sortBy' && value !== 'all' && value !== '';
    }
  ).length + (filters.search ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Documents</h2>
          <p className="text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? 's' : ''} • 
            {filteredDocuments.length} showing
          </p>
        </div>
        
        <Button
          onClick={() => {
            setEditingDocument(null);
            setIsCreateModalOpen(true);
          }}
          className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Document
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 min-w-0">
              <SearchInput
                placeholder="Search documents..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                onClear={() => handleFilterChange('search', '')}
                className="w-full"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Tag Filter */}
              <Select
                value={filters.tag}
                onValueChange={(value) => handleFilterChange('tag', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {uniqueTags.map(tag => (
                    <SelectItem key={tag} value={tag}>
                      <Badge variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange('sortBy', value)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="modified">Last Modified</SelectItem>
                  <SelectItem value="created">Date Created</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                </SelectContent>
              </Select>

              {/* Advanced Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="whitespace-nowrap"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Filters
                {activeFilterCount > 0 && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Author Filter */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Author
                  </label>
                  <Select
                    value={filters.author}
                    onValueChange={(value) => handleFilterChange('author', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Authors" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Authors</SelectItem>
                      <SelectItem value="me">My Documents</SelectItem>
                      {uniqueAuthors.map(author => (
                        <SelectItem key={author} value={author}>
                          {author}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filter Summary */}
              {activeFilterCount > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
                    </span>
                    <span className="text-foreground font-medium">
                      Showing {filteredDocuments.length} of {documents.length} documents
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadDocuments}
              className="mt-2"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Documents Grid */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document, index) => (
            <DocumentCard
              key={document.$id}
              document={document}
              onEdit={handleDocumentEdit}
              onDelete={handleDocumentDelete}
              onView={handleDocumentView}
              aria-posinset={index + 1}
              aria-setsize={filteredDocuments.length}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {documents.length === 0 ? 'No documents yet' : 'No documents match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {documents.length === 0 
                    ? 'Create your first team document to start collaborating'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {documents.length === 0 ? (
                  <Button
                    onClick={() => {
                      setEditingDocument(null);
                      setIsCreateModalOpen(true);
                    }}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create First Document
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <DocumentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingDocument(null);
        }}
        onDocumentCreated={handleDocumentCreated}
        editDocument={editingDocument}
      />
    </div>
  );
};

export default DocumentList;