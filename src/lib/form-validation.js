// Form validation utilities for use with react-hook-form and Shadcn forms

// Common validation rules
export const validationRules = {
  required: (message = "This field is required") => ({
    required: { value: true, message }
  }),

  minLength: (min, message) => ({
    minLength: { 
      value: min, 
      message: message || `Must be at least ${min} characters` 
    }
  }),

  maxLength: (max, message) => ({
    maxLength: { 
      value: max, 
      message: message || `Must be no more than ${max} characters` 
    }
  }),

  email: (message = "Please enter a valid email address") => ({
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message
    }
  }),

  noWhitespace: (message = "This field cannot be empty or contain only spaces") => ({
    validate: (value) => {
      if (typeof value === 'string' && value.trim().length === 0) {
        return message;
      }
      return true;
    }
  })
};

// Task-specific validation schemas
export const taskValidationSchema = {
  title: {
    ...validationRules.required("Task title is required"),
    ...validationRules.minLength(1, "Task title cannot be empty"),
    ...validationRules.maxLength(100, "Task title must be 100 characters or less"),
    ...validationRules.noWhitespace("Task title cannot be empty or contain only spaces")
  },

  description: {
    ...validationRules.required("Task description is required"),
    ...validationRules.minLength(1, "Task description cannot be empty"),
    ...validationRules.maxLength(500, "Task description must be 500 characters or less"),
    ...validationRules.noWhitespace("Task description cannot be empty or contain only spaces")
  },

  priority: {
    ...validationRules.required("Please select a priority level")
  },

  assignedTo: {
    ...validationRules.required("Please assign this task to someone")
  }
};

// Form default values
export const taskFormDefaults = {
  title: '',
  description: '',
  priority: 'medium',
  labels: [],
  assignedTo: ''
};

// Priority options for select components
export const priorityOptions = [
  { value: 'low', label: '🟢 Low Priority' },
  { value: 'medium', label: '🟡 Medium Priority' },
  { value: 'high', label: '🔴 High Priority' }
];

// Helper function to transform form data for API submission
export const transformTaskFormData = (formData, user, members) => {
  const assignedMember = members?.find(member => member.id === formData.assignedTo);
  const assignedName = assignedMember?.name || user?.name;

  return {
    title: formData.title.trim(),
    description: formData.description.trim(),
    assignedTo: formData.assignedTo,
    assigned_to: assignedName,
    priority: formData.priority,
    labels: formData.labels || []
  };
};

// Helper function to populate form with existing task data
export const populateTaskForm = (task, userId) => {
  return {
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    labels: task?.labels || [],
    assignedTo: task?.assignedTo || userId || ''
  };
};