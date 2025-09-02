import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeamMembers } from '../hooks/useHackathonTeamMembers';
import { taskService } from '../services/taskService';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Badge } from './ui/badge';

// Priority options for the select component
const priorityOptions = [
  { value: 'low', label: '🟢 Low Priority' },
  { value: 'medium', label: '🟡 Medium Priority' },
  { value: 'high', label: '🔴 High Priority' }
];

const TaskModal = ({ isOpen, onClose, onTaskCreated, onTaskUpdated, editTask = null }) => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { members } = useHackathonTeamMembers();
  const [team, setTeam] = useState(null);
  const [newLabel, setNewLabel] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      labels: [],
      assignedTo: user?.$id || ''
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

  // Initialize form data when modal opens or when editing a task
  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        // Populate form with existing task data
        form.reset({
          title: editTask.title || '',
          description: editTask.description || '',
          priority: editTask.priority || 'medium',
          labels: editTask.labels || [],
          assignedTo: editTask.assignedTo || user?.$id || ''
        });
      } else {
        // Reset form for new task
        form.reset({
          title: '',
          description: '',
          priority: 'medium',
          labels: [],
          assignedTo: user?.$id || ''
        });
      }
      setNewLabel('');
    }
  }, [isOpen, editTask, user?.$id, form]);

  const addLabel = () => {
    const currentLabels = form.getValues('labels');
    if (newLabel.trim() && !currentLabels.includes(newLabel.trim())) {
      form.setValue('labels', [...currentLabels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove) => {
    const currentLabels = form.getValues('labels');
    form.setValue('labels', currentLabels.filter(label => label !== labelToRemove));
  };

  const handleSubmit = async (data) => {
    if (!user?.$id || !team?.$id) {
      form.setError('root', { message: 'User or team information is missing' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the assigned member to get their name
      const assignedMember = members.find(member => member.id === data.assignedTo);
      const assignedName = assignedMember?.name || user.name;

      if (editTask) {
        // Update existing task
        const updates = {
          title: data.title.trim(),
          description: data.description.trim(),
          assignedTo: data.assignedTo,
          assigned_to: assignedName, // Update display name
          priority: data.priority,
          labels: data.labels
        };

        console.log('Updating task with data:', updates);
        const updatedTask = await taskService.updateTaskFields(editTask.$id, updates);

        // Notify parent component
        if (onTaskUpdated) {
          onTaskUpdated(updatedTask);
        }
      } else {
        // Create new task
        const taskData = {
          title: data.title.trim(),
          description: data.description.trim(),
          assignedTo: data.assignedTo,
          createdBy: user.$id,
          priority: data.priority,
          labels: data.labels
        };

        console.log('Creating task with data:', taskData);
        const newTask = await taskService.createTask(team.$id, hackathonId, taskData, user.name, assignedName);

        // Notify parent component
        if (onTaskCreated) {
          onTaskCreated(newTask);
        }
      }

      // Reset form and close modal
      form.reset();
      setNewLabel('');
      onClose();
    } catch (error) {
      console.error(`Error ${editTask ? 'updating' : 'creating'} task:`, error);
      form.setError('root', { message: error.message || `Failed to ${editTask ? 'update' : 'create'} task` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      form.reset();
      setNewLabel('');
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              {editTask ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {editTask ? 'Edit Task' : 'Create New Task'}
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
                  required: "Task title is required",
                  maxLength: { value: 100, message: "Title must be 100 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Task Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isSubmitting}
                        placeholder="What needs to be done?"
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500 h-12 text-base"
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
                  required: "Task description is required",
                  maxLength: { value: 500, message: "Description must be 500 characters or less" }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        disabled={isSubmitting}
                        rows={3}
                        placeholder="Describe the task details..."
                        className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Two Column Layout for Priority and Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Field */}
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Priority
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger className="w-full bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {priorityOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assignee Field */}
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-white">
                        <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Assign To
                      </FormLabel>
                      {team?.userRole === 'owner' ? (
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                          <FormControl>
                            <SelectTrigger className="w-full bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500">
                              <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {members.map((member) => (
                              <SelectItem key={member.id} value={member.id}>
                                {member.name} {member.role === 'owner' ? '(Leader)' : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-background-sidebar rounded-xl border border-dark-primary/30">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                            <span className="text-xs font-bold text-white">
                              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user?.name || 'You'}</p>
                            <p className="text-xs text-dark-tertiary">Self-assigned</p>
                          </div>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Labels Section */}
              <FormField
                control={form.control}
                name="labels"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center text-white">
                      <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Labels
                    </FormLabel>
                    
                    {/* Label Input */}
                    <div className="flex gap-2 mb-3">
                      <Input
                        type="text"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addLabel();
                          }
                        }}
                        disabled={isSubmitting}
                        className="flex-1 text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500 h-8"
                        placeholder="Add a label..."
                        maxLength={20}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLabel}
                        disabled={isSubmitting || !newLabel.trim()}
                        className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 border-primary/30 hover:bg-primary/20"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add
                      </Button>
                    </div>

                    {/* Label Display */}
                    {field.value && field.value.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {field.value.map((label, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30 transition-colors duration-200"
                          >
                            {label}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeLabel(label)}
                              disabled={isSubmitting}
                              className="ml-2 h-auto p-0 text-primary hover:text-primary/80 disabled:opacity-50"
                              aria-label={`Remove ${label} label`}
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
            className="px-6 py-3 text-sm font-semibold min-h-[48px] bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
            aria-describedby={isSubmitting ? "submit-status" : undefined}
          >
            {isSubmitting ? (
              <>
                <span className="flex items-center justify-center">
                  <div className="spinner w-4 h-4 mr-2 text-white" aria-hidden="true"></div>
                  {editTask ? 'Updating...' : 'Creating...'}
                </span>
                <span id="submit-status" className="sr-only">{editTask ? 'Updating task, please wait' : 'Creating task, please wait'}</span>
              </>
            ) : (
              editTask ? 'Update Task' : 'Create Task'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;