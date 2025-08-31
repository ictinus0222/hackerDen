import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeamMembers } from '../hooks/useHackathonTeamMembers';
import { taskService } from '../services/taskService';
import { teamService } from '../services/teamService';
import { Button } from './ui/button';
import { InputField, TextareaField } from './ui';
import { PriorityBadge } from './ui/status-badge';

// Custom Dropdown Component
const CustomDropdown = ({ 
  label, 
  value, 
  onChange, 
  options, 
  disabled = false, 
  placeholder = "Select an option",
  required = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-dark-secondary mb-2">
        {label} {required && <span className="text-red-400" aria-label="required">*</span>}
      </label>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-4 py-3 text-base rounded-xl justify-between ${
          isOpen ? 'ring-2 ring-ring border-ring' : ''
        }`}
        style={{ fontSize: '16px' }}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <Button
              key={option.value}
              type="button"
              variant="ghost"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-base justify-start rounded-none first:rounded-t-xl last:rounded-b-xl ${
                value === option.value 
                  ? 'bg-accent text-accent-foreground border-l-2 border-primary' 
                  : 'text-popover-foreground hover:text-primary'
              }`}
            >
              {option.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

const TaskModal = ({ isOpen, onClose, onTaskCreated, onTaskUpdated, editTask = null }) => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const { members } = useHackathonTeamMembers();
  const [team, setTeam] = useState(null);
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
        const newTask = await taskService.createTask(team.$id, hackathonId, taskData, user.name, assignedName);

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
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <div 
        className="w-full max-w-lg max-h-[90vh] overflow-hidden animate-slide-up rounded-2xl shadow-card border border-dark-primary/10"
        style={{ backgroundColor: '#1E2B29' }}
      >
        {/* Modal Header */}
        <header className="flex items-center justify-between p-6 border-b border-dark-primary/20">
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
            <h2 id="modal-title" className="text-xl font-bold text-white">
              {editTask ? 'Edit Task' : 'Create New Task'}
            </h2>
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
        </header>

        {/* Modal Body */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <form id="task-form" onSubmit={handleSubmit} className="p-6" noValidate>
            {/* General Error */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-300">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Main Content Section */}
            <div className="space-y-5">
              {/* Title Field - Full Width */}
              <InputField
                label={
                  <span className="flex items-center text-white">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Task Title
                  </span>
                }
                name="title"
                type="text"
                variant="large"
                required
                error={errors.title}
                value={formData.title}
                onChange={handleInputChange}
                disabled={isSubmitting}
                placeholder="What needs to be done?"
                maxLength={100}
                className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500"
                style={{ fontSize: '16px' }}
              />

              {/* Description Field - Full Width */}
              <TextareaField
                label={
                  <span className="flex items-center text-white">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    Description
                  </span>
                }
                name="description"
                required
                error={errors.description}
                value={formData.description}
                onChange={handleInputChange}
                disabled={isSubmitting}
                rows={3}
                placeholder="Describe the task details..."
                maxLength={500}
                showCharCount
                className="text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500 resize-none"
                style={{ fontSize: '16px' }}
              />

              {/* Two Column Layout for Priority and Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Priority Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Priority
                  </label>
                  <CustomDropdown
                    label=""
                    value={formData.priority}
                    onChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
                    options={[
                      { value: 'low', label: '🟢 Low Priority' },
                      { value: 'medium', label: '🟡 Medium Priority' },
                      { value: 'high', label: '🔴 High Priority' }
                    ]}
                    disabled={isSubmitting}
                    placeholder="Select priority"
                  />
                </div>

                {/* Assignee Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Assign To
                  </label>
                  {team?.userRole === 'owner' ? (
                    <CustomDropdown
                      label=""
                      value={formData.assignedTo}
                      onChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
                      options={members.map((member) => ({
                        value: member.id,
                        label: `${member.name} ${member.role === 'owner' ? '(Leader)' : ''}`
                      }))}
                      disabled={isSubmitting}
                      placeholder="Select member"
                    />
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
                </div>
              </div>

              {/* Labels Section */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Labels
                </label>
                
                {/* Label Input */}
                <div className="flex gap-2 mb-3">
                  <InputField
                    type="text"
                    variant="compact"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addLabel();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 text-white placeholder-dark-tertiary bg-background-sidebar border-dark-primary/30 hover:border-green-500/50 focus:ring-green-500 focus:border-green-500"
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
                {formData.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.labels.map((label, index) => (
                      <span
                        key={index}
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
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </form>
        </div>

        {/* Modal Footer */}
        <footer className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 sm:space-x-3 sm:gap-0 p-6 border-t border-border">
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
            form="task-form"
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
        </footer>
      </div>
    </div>
  );
};

export default TaskModal;