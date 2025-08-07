import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeam } from '../hooks/useTeam';
import { taskService } from '../services/taskService';

const TaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const { user } = useAuth();
  const { team } = useTeam();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    labels: []
  });

  const [newLabel, setNewLabel] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignedTo: user.$id,
        createdBy: user.$id,
        priority: formData.priority,
        labels: formData.labels
      };

      console.log('Creating task with data:', taskData);
      console.log('Team ID:', team.$id);
      console.log('User:', user);

      const newTask = await taskService.createTask(team.$id, taskData, user.name);

      // Reset form
      setFormData({ title: '', description: '', priority: 'medium', labels: [] });
      setNewLabel('');
      setErrors({});

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(newTask);
      }

      // Close modal
      onClose();
    } catch (error) {
      console.error('Error creating task:', error);
      setErrors({ general: error.message || 'Failed to create task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ title: '', description: '' });
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
      <div className="rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700/50 bg-slate-800/95 backdrop-blur-sm animate-bounce-in">
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-slate-700/50 sticky top-0 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-xl font-bold text-slate-100">
              Create New Task
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-300 active:text-slate-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 p-2 -m-2 min-h-[44px] min-w-[44px] touch-manipulation rounded-md"
            aria-label="Close dialog"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 bg-slate-800/95" noValidate>
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
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
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
              className={`w-full px-4 py-3 text-base rounded-xl shadow-sm bg-slate-700/60 text-slate-200 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-800/50 disabled:text-slate-400 placeholder-slate-400 ${errors.title ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''
                }`}
              placeholder="Enter task title"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
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
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
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
              className={`w-full px-4 py-3 text-base rounded-xl shadow-sm bg-slate-700/60 text-slate-200 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-800/50 disabled:text-slate-400 placeholder-slate-400 resize-none ${errors.description ? 'border-red-400 focus:ring-red-500 focus:border-red-400' : ''
                }`}
              placeholder="Enter task description"
              style={{ fontSize: '16px' }} // Prevents zoom on iOS
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
            <label htmlFor="priority" className="block text-sm font-medium text-slate-300 mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-3 text-base rounded-xl shadow-sm bg-slate-700/60 text-slate-200 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-800/50 disabled:text-slate-400"
              style={{ fontSize: '16px' }}
            >
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
          </div>

          {/* Assignee Field */}
          <div className="mb-4">
            <label htmlFor="assignedTo" className="block text-sm font-medium text-slate-300 mb-2">
              Assign To
            </label>
            <div className="flex items-center space-x-3 p-3 bg-slate-700/40 rounded-xl border border-slate-600/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center ring-2 ring-green-500/20">
                <span className="text-sm font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-200">{user?.name || 'Unknown User'}</p>
                <p className="text-xs text-slate-400">Assigned to you</p>
              </div>
            </div>
          </div>

          {/* Labels Field */}
          <div className="mb-6">
            <label htmlFor="labels" className="block text-sm font-medium text-slate-300 mb-2">
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
                className="flex-1 px-3 py-2 text-sm rounded-lg shadow-sm bg-slate-700/60 text-slate-200 border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-slate-800/50 placeholder-slate-400"
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
          <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-3 sm:gap-0 bg-slate-800/90 p-6 rounded-b-2xl border-t border-slate-700/50">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-6 py-3 text-sm font-semibold text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] touch-manipulation bg-slate-700/60 hover:bg-slate-600/60 transition-all duration-200"
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
                    Creating...
                  </span>
                  <span id="submit-status" className="sr-only">Creating task, please wait</span>
                </>
              ) : (
                'Create Task'
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;