import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';

const DocumentCreateModal = ({ 
  isOpen, 
  onClose, 
  onDocumentCreated, 
  editDocument = null 
}) => {
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      title: '',
      content: '',
      tags: [],
      permissions: {
        visibility: 'team',
        allowEdit: true,
        allowComment: true
      }
    }
  });

  // Initialize form data when modal opens or when editing a document
  useEffect(() => {
    if (isOpen) {
      if (editDocument) {
        // Populate form with existing document data
        form.reset({
          title: editDocument.title || '',
          content: editDocument.content || '',
          tags: editDocument.tags || [],
          permissions: {
            visibility: editDocument.permissions?.visibility || 'team',
            allowEdit: editDocument.permissions?.allowEdit ?? true,
            allowComment: editDocument.permissions?.allowComment ?? true
          }
        });
      } else {
        // Reset form for new document
        form.reset({
          title: '',
          content: '',
          tags: [],
          permissions: {
            visibility: 'team',
            allowEdit: true,
            allowComment: true
          }
        });
      }
      setNewTag('');
    }
  }, [isOpen, editDocument, form]);

  const addTag = () => {
    const currentTags = form.getValues('tags');
    if (newTag.trim() && !currentTags.includes(newTag.trim())) {
      form.setValue('tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    const currentTags = form.getValues('tags');
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const documentData = {
        title: data.title.trim(),
        content: data.content.trim(),
        tags: data.tags,
        permissions: data.permissions
      };

      console.log(`${editDocument ? 'Updating' : 'Creating'} document with data:`, documentData);

      // Notify parent component
      if (onDocumentCreated) {
        onDocumentCreated(documentData, editDocument);
      }

      // Reset form and close modal
      form.reset();
      setNewTag('');
      onClose();
    } catch (error) {
      console.error(`Error ${editDocument ? 'updating' : 'creating'} document:`, error);
      form.setError('root', { 
        message: error.message || `Failed to ${editDocument ? 'update' : 'create'} document` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setNewTag('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl shadow-card border border-dark-primary/10 bg-[#1E2B29]"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-dark-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              {editDocument ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {editDocument ? 'Edit Document' : 'Create New Document'}
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close dialog"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </DialogHeader>

        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="p-6 space-y-5">
              {/* General Error */}
              {form.formState.errors.root && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-300">{form.formState.errors.root.message}</p>
                  </div>
                </div>
              )}

              {/* Title Field */}
              <FormField
                control={form.control}
                name="title"
                rules={{ 
                  required: "Document title is required",
                  maxLength: { value: 200, message: "Title must be 200 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Document Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="Enter document title..."
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content Field */}
              <FormField
                control={form.control}
                name="content"
                rules={{ 
                  maxLength: { value: 50000, message: "Content must be 50,000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Content (Markdown supported)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        rows={6}
                        placeholder="Start writing your document content... You can use markdown syntax like **bold**, *italic*, # headers, etc."
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono text-sm"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags and Permissions Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tags Section */}
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Tags
                      </FormLabel>
                      
                      {/* Tag Input */}
                      <div className="flex gap-2 mb-3">
                        <Input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                          disabled={isSubmitting}
                          className="flex-1 text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500 h-8"
                          placeholder="Add a tag..."
                          maxLength={20}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addTag}
                          disabled={isSubmitting || !newTag.trim()}
                          className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border-primary/30 hover:bg-primary/20"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Add
                        </Button>
                      </div>

                      {/* Tag Display */}
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200"
                            >
                              {tag}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeTag(tag)}
                                disabled={isSubmitting}
                                className="ml-2 h-auto p-0 text-primary hover:text-primary/80 disabled:opacity-50"
                                aria-label={`Remove ${tag} tag`}
                              >
                                ×
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions Section */}
                <FormField
                  control={form.control}
                  name="permissions.visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Visibility
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500">
                            <SelectValue placeholder="Select visibility" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="team">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              All Team Members
                            </div>
                          </SelectItem>
                          <SelectItem value="leaders">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                              Team Leaders Only
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-3 sm:gap-0 p-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-semibold min-h-[48px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-semibold min-h-[48px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            aria-describedby={isSubmitting ? "submit-status" : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2 text-white" aria-hidden="true"></div>
                  {editDocument ? 'Updating...' : 'Creating...'}
                </span>
                <span id="submit-status" className="sr-only">
                  {editDocument ? 'Updating document, please wait' : 'Creating document, please wait'}
                </span>
              </>
            ) : (
              editDocument ? 'Update Document' : 'Create Document'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentCreateModal;