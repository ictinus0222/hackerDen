import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { taskService } from '../services/taskService';

const TaskModal = ({ isOpen, onClose, onTaskCreated, onTaskUpdated, editTask = null }) => {
  const { user } = useAuth();
  const { team } = useTeam();
  const { members } = useTeamMembers();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    labels: [],
    assignedTo: user?.$id || ''
  });

  const [newLabel, setNewLabel] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or when editing a task
  useEffect(() => {
    if (isOpen) {
      if (editTask) {
        // Populate form with existing task data
        setFormData({
          title: editTask.title || '',
          description: editTask.description || '',
          priority: editTask.priority || 'medium',
          labels: editTask.labels || [],
          assignedTo: editTask.assignedTo || user?.$id || ''
        });
      } else {
        // Reset form for new task
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          labels: [],
          assignedTo: user?.$id || ''
        });
      }
      setErrors({});
      setNewLabel('');
    }
  }, [isOpen, editTask, user?.$id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addLabel = () => {
    if (newLabel.trim() && !formData.labels.includes(newLabel.trim())) {
      setFormData(prev => ({
        ...prev,
        labels: [...prev.labels, newLabel.trim()]
      }));
      setNewLabel('');
    }
  };

  const removeLabel = (labelToRemove) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.filter(label => label !== labelToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Task description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.$id || !team?.$id) {
      setErrors({ general: 'User or team information is missing' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Find the assigned member to get their name
      const assignedMember = members.find(member => member.id === formData.assignedTo);
      const assignedName = assignedMember?.name || user.name;

      if (editTask) {
        // Update existing task
        const updates = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignedTo,
          assigned_to: assignedName, // Update display name
          priority: formData.priority,
          labels: formData.labels
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
          title: formData.title.trim(),
          description: formData.description.trim(),
          assignedTo: formData.assignedTo,
          createdBy: user.$id,
          priority: formData.priority,
          labels: formData.labels
        };

        console.log('Creating task with data:', taskData);
        const newTask = await taskService.createTask(team.$id, taskData, user.name, assignedName);

        // Notify parent component
        if (onTaskCreated) {
          onTaskCreated(newTask);
        }
      }

      // Reset form
      setFormData({ title: '', description: '', priority: 'medium', labels: [], assignedTo: user?.$id || '' });
      setNewLabel('');
      setErrors({});

      // Close modal
      onClose();
    } catch (error) {
      console.error(`Error ${editTask ? 'updating' : 'creating'} task:`, error);
      setErrors({ general: error.message || `Failed to ${editTask ? 'update' : 'create'} task` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: '', description: '', priority: 'medium', labels: [], assignedTo: user?.$id || '' });
      setErrors({});
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div className="card-enhanced rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-bounce-in">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-dark-primary/20 sticky top-0 backdrop-blur-sm rounded-t-2xl" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-xl font-bold text-dark-primary">
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-dark-tertiary hover:text-dark-secondary active:text-dark-primary focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 p-2 -m-2 min-h-[44px] min-w-[44px] touch-manipulation rounded-md"
            aria-label="Close dialog"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6" style={{ background: 'rgba(30, 41, 59, 0.4)' }} noValidate>
          {/* General Error */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md" role="alert">
              <div className="flex items-center">
                <svg className="w-4 h-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Title Field */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-dark-secondary mb-2">
              Task Title <span className="text-red-400" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
              aria-invalid={errors.title ? 'true' : 'false'}
              aria-describedby={errors.title ? 'title-error' : undefined}
              className={`w-full px-4 py-3 text-base rounded-xl shadow-sm backdrop-blur-sm text-dark-primary border border-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:text-dark-tertiary placeholder-dark-tertiary ${errors.title ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''
                }`}
              style={{ background: 'rgba(30, 41, 59, 0.3)', fontSize: '16px' }} // Prevents zoom on iOS
              placeholder="Enter task title"
              maxLength={100}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-600" role="alert">
                <span className="sr-only">Error: </span>
                {errors.title}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-dark-secondary mb-2">
              Task Description <span className="text-red-400" aria-label="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              required
              rows={4}
              aria-invalid={errors.description ? 'true' : 'false'}
              aria-describedby={errors.description ? 'description-error' : undefined}
              className={`w-full px-4 py-3 text-base rounded-xl shadow-sm backdrop-blur-sm text-dark-primary border border-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:text-dark-tertiary placeholder-dark-tertiary resize-none ${errors.description ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''
                }`}
              style={{ background: 'rgba(30, 41, 59, 0.3)', fontSize: '16px' }} // Prevents zoom on iOS
              placeholder="Enter task description"
              maxLength={500}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-sm text-red-600" role="alert">
                <span className="sr-only">Error: </span>
                {errors.description}
              </p>
            )}
          </div>

          {/* Priority Field */}
          <div className="mb-4">
            <label htmlFor="priority" className="block text-sm font-medium text-dark-secondary mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-base rounded-xl shadow-sm backdrop-blur-sm text-dark-primary border border-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:text-dark-tertiary"
              style={{ background: 'rgba(30, 41, 59, 0.3)', fontSize: '16px' }}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          {/* Assignee Field */}
          <div className="mb-4">
            <label htmlFor="assignedTo" className="block text-sm font-medium text-dark-secondary mb-2">
              Assign To
            </label>
            {team?.userRole === 'owner' ? (
              // Team Leader can assign to any member
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 text-base rounded-xl shadow-sm backdrop-blur-sm text-dark-primary border border-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:text-dark-tertiary"
                style={{ background: 'rgba(30, 41, 59, 0.3)', fontSize: '16px' }}
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.role === 'owner' ? '(Team Leader)' : '(Member)'}
                  </option>
                ))}
              </select>
            ) : (
              // Regular members can only assign to themselves
              <div className="flex items-center space-x-3 p-3 backdrop-blur-sm rounded-xl border border-dark-primary/20" style={{ background: 'rgba(30, 41, 59, 0.3)' }}>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
                  <span className="text-sm font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark-primary">{user?.name || 'Unknown User'}</p>
                  <p className="text-xs text-dark-tertiary">Assigned to you</p>
                </div>
              </div>
            )}
          </div>

          {/* Labels Field */}
          <div className="mb-6">
            <label htmlFor="labels" className="block text-sm font-medium text-dark-secondary mb-2">
              Labels
            </label>
            <div className="flex gap-2 mb-2">
              <input
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
                className="flex-1 px-3 py-2 text-sm rounded-lg shadow-sm backdrop-blur-sm text-dark-primary border border-dark-primary/20 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 placeholder-dark-tertiary"
                style={{ background: 'rgba(30, 41, 59, 0.3)' }}
                placeholder="Add label (e.g., bug, feature, urgent)"
                maxLength={20}
              />
              <button
                type="button"
                onClick={addLabel}
                disabled={isSubmitting || !newLabel.trim()}
                className="px-4 py-2 text-sm font-medium text-green-300 bg-green-500/20 rounded-lg hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed border border-green-500/30"
              >
                Add
              </button>
            </div>
            {formData.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.labels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => removeLabel(label)}
                      disabled={isSubmitting}
                      className="ml-2 text-green-300 hover:text-green-200 disabled:opacity-50"
                      aria-label={`Remove ${label} label`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-3 sm:gap-0 p-6 rounded-b-2xl border-t border-dark-primary/20 backdrop-blur-sm" style={{ background: 'rgba(30, 41, 59, 0.6)' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-dark-secondary rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation backdrop-blur-sm hover:backdrop-blur-md transition-all duration-200 border border-dark-primary/20"
              style={{ background: 'rgba(30, 41, 59, 0.4)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
              aria-describedby={isSubmitting ? "submit-status" : undefined}
            >
              {isSubmitting ? (
                <>
                  <span className="flex items-center">
                    <div className="spinner w-4 h-4 mr-2 text-white" aria-hidden="true"></div>
                    {editTask ? 'Updating...' : 'Creating...'}
                  </span>
                  <span id="submit-status" className="sr-only">{editTask ? 'Updating task, please wait' : 'Creating task, please wait'}</span>
                </>
              ) : (
                editTask ? 'Update Task' : 'Create Task'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;