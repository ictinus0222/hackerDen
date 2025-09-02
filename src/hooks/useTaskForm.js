import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { 
  taskValidationSchema, 
  taskFormDefaults, 
  transformTaskFormData, 
  populateTaskForm 
} from '../lib/form-validation';

/**
 * Custom hook for managing task form state and validation
 * Integrates with Shadcn Form components and react-hook-form
 */
export const useTaskForm = ({ 
  editTask = null, 
  user = null, 
  members = [], 
  onSubmit, 
  onError 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm({
    defaultValues: taskFormDefaults,
    mode: 'onChange', // Validate on change for better UX
    resolver: undefined // We'll use manual validation for better control
  });

  const { 
    control, 
    handleSubmit, 
    reset, 
    setValue, 
    watch, 
    formState: { errors, isValid, isDirty } 
  } = form;

  // Watch form values for dynamic updates
  const watchedValues = watch();

  // Initialize form data when editTask or user changes
  useEffect(() => {
    if (editTask) {
      const populatedData = populateTaskForm(editTask, user?.$id);
      reset(populatedData);
    } else {
      reset({
        ...taskFormDefaults,
        assignedTo: user?.$id || ''
      });
    }
  }, [editTask, user?.$id, reset]);

  // Form submission handler
  const onFormSubmit = async (formData) => {
    if (!user?.$id) {
      onError?.({ general: 'User information is missing' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform form data for API submission
      const transformedData = transformTaskFormData(formData, user, members);
      
      // Call the provided onSubmit handler
      await onSubmit(transformedData);
      
      // Reset form on successful submission (for new tasks)
      if (!editTask) {
        reset({
          ...taskFormDefaults,
          assignedTo: user?.$id || ''
        });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      onError?.({ 
        general: error.message || `Failed to ${editTask ? 'update' : 'create'} task` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Label management functions
  const addLabel = (newLabel) => {
    if (newLabel.trim() && !watchedValues.labels.includes(newLabel.trim())) {
      const updatedLabels = [...watchedValues.labels, newLabel.trim()];
      setValue('labels', updatedLabels, { shouldDirty: true });
      return true;
    }
    return false;
  };

  const removeLabel = (labelToRemove) => {
    const updatedLabels = watchedValues.labels.filter(label => label !== labelToRemove);
    setValue('labels', updatedLabels, { shouldDirty: true });
  };

  // Manual validation function
  const validateForm = () => {
    const newErrors = {};

    // Validate title
    const title = watchedValues.title?.trim();
    if (!title) {
      newErrors.title = 'Task title is required';
    } else if (title.length > 100) {
      newErrors.title = 'Task title must be 100 characters or less';
    }

    // Validate description
    const description = watchedValues.description?.trim();
    if (!description) {
      newErrors.description = 'Task description is required';
    } else if (description.length > 500) {
      newErrors.description = 'Task description must be 500 characters or less';
    }

    // Validate priority
    if (!watchedValues.priority) {
      newErrors.priority = 'Please select a priority level';
    }

    // Validate assignedTo
    if (!watchedValues.assignedTo) {
      newErrors.assignedTo = 'Please assign this task to someone';
    }

    return newErrors;
  };

  // Check if form is valid
  const isFormValid = () => {
    const errors = validateForm();
    return Object.keys(errors).length === 0;
  };

  // Reset form to initial state
  const resetForm = () => {
    reset(editTask ? populateTaskForm(editTask, user?.$id) : {
      ...taskFormDefaults,
      assignedTo: user?.$id || ''
    });
  };

  return {
    // Form instance and control
    form,
    control,
    
    // Form state
    formValues: watchedValues,
    errors,
    isValid: isFormValid(),
    isDirty,
    isSubmitting,
    
    // Form actions
    handleSubmit: handleSubmit(onFormSubmit),
    reset: resetForm,
    setValue,
    
    // Label management
    addLabel,
    removeLabel,
    
    // Validation
    validateForm,
    isFormValid,
    
    // Utility functions
    setIsSubmitting
  };
};