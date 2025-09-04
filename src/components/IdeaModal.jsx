import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { ideaService } from '../services/ideaService';
import { teamService } from '../services/teamService';
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
import { Badge } from './ui/badge';

const IdeaModal = ({ isOpen, onClose, onIdeaCreated, editIdea = null }) => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      tags: []
    }
  });

  // Get user's team for this hackathon
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.$id || !hackathonId) {
        setTeam(null);
        return;
      }

      try {
        const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
        setTeam(userTeam);
      } catch (err) {
        console.error('Error fetching team:', err);
        setTeam(null);
      }
    };

    if (isOpen) {
      fetchTeam();
    }
  }, [user?.$id, hackathonId, isOpen]);

  // Initialize form data when modal opens or when editing an idea
  useEffect(() => {
    if (isOpen) {
      if (editIdea) {
        // Populate form with existing idea data
        form.reset({
          title: editIdea.title || '',
          description: editIdea.description || '',
          tags: editIdea.tags || []
        });
      } else {
        // Reset form for new idea
        form.reset({
          title: '',
          description: '',
          tags: []
        });
      }
      setNewTag('');
    }
  }, [isOpen, editIdea, form]);

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
    if (!user?.$id || !team?.$id) {
      form.setError('root', { message: 'User or team information is missing' });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editIdea) {
        // For now, we'll just close the modal since editing isn't implemented yet
        // This would be implemented in a future task
        console.log('Editing ideas not yet implemented');
        form.setError('root', { message: 'Editing ideas is not yet implemented' });
        return;
      } else {
        // Create new idea
        const ideaData = {
          title: data.title.trim(),
          description: data.description.trim(),
          tags: data.tags,
          createdBy: user.$id
        };

        console.log('Creating idea with data:', ideaData);
        const newIdea = await ideaService.createIdea(team.$id, hackathonId, ideaData, user.name);

        // Notify parent component
        if (onIdeaCreated) {
          onIdeaCreated(newIdea);
        }
      }

      // Reset form and close modal
      form.reset();
      setNewTag('');
      onClose();
    } catch (error) {
      console.error(`Error ${editIdea ? 'updating' : 'creating'} idea:`, error);
      form.setError('root', { message: error.message || `Failed to ${editIdea ? 'update' : 'create'} idea` });
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
        className="w-full max-w-lg max-h-[90vh] overflow-hidden rounded-2xl shadow-card border border-dark-primary/10 bg-[#1E2B29]"
        showCloseButton={false}
      >
        <DialogHeader className="flex flex-row items-center justify-between p-6 border-b border-dark-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              {editIdea ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {editIdea ? 'Edit Idea' : 'Submit New Idea'}
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
                  required: "Idea title is required",
                  maxLength: { value: 100, message: "Title must be 100 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Idea Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="What's your brilliant idea?"
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500 h-12 text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description Field */}
              <FormField
                control={form.control}
                name="description"
                rules={{ 
                  required: "Idea description is required",
                  maxLength: { value: 1000, message: "Description must be 1000 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        rows={4}
                        placeholder="Describe your idea in detail. What problem does it solve? How would it work?"
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-blue-500/50 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        placeholder="Add a tag (e.g., frontend, AI, mobile)..."
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
            className="px-6 py-3 text-sm font-semibold min-h-[48px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            aria-describedby={isSubmitting ? "submit-status" : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2 text-white" aria-hidden="true"></div>
                  {editIdea ? 'Updating...' : 'Submitting...'}
                </span>
                <span id="submit-status" className="sr-only">{editIdea ? 'Updating idea, please wait' : 'Submitting idea, please wait'}</span>
              </>
            ) : (
              editIdea ? 'Update Idea' : 'Submit Idea'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IdeaModal;