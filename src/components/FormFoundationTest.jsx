import React, { useState } from 'react';
import { useTaskForm } from '../hooks/useTaskForm';
import { Form } from './ui/form';
import { FormField } from './ui/form-field';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { priorityOptions } from '../lib/form-validation';

/**
 * Test component demonstrating the Shadcn Form foundation
 * This shows how to use the new form system with validation and error handling
 */
const FormFoundationTest = () => {
  const [submitResult, setSubmitResult] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Mock user and members data for testing
  const mockUser = { $id: 'user-123', name: 'Test User' };
  const mockMembers = [
    { id: 'user-123', name: 'Test User', role: 'owner' },
    { id: 'user-456', name: 'Team Member', role: 'member' }
  ];

  // Mock task for edit mode testing
  const mockEditTask = {
    title: 'Sample Task',
    description: 'This is a sample task for testing the form',
    priority: 'high',
    labels: ['frontend', 'urgent'],
    assignedTo: 'user-456'
  };

  const [editMode, setEditMode] = useState(false);

  // Initialize the task form hook
  const {
    form,
    control,
    formValues,
    errors,
    isValid,
    isDirty,
    isSubmitting,
    handleSubmit,
    reset,
    addLabel,
    removeLabel
  } = useTaskForm({
    editTask: editMode ? mockEditTask : null,
    user: mockUser,
    members: mockMembers,
    onSubmit: async (formData) => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitResult({
        success: true,
        data: formData,
        message: `Task ${editMode ? 'updated' : 'created'} successfully!`
      });
    },
    onError: (error) => {
      setFormErrors(error);
      setSubmitResult({
        success: false,
        error: error.general || 'An error occurred'
      });
    }
  });

  const [newLabel, setNewLabel] = useState('');

  const handleAddLabel = () => {
    if (addLabel(newLabel)) {
      setNewLabel('');
    }
  };

  const memberOptions = mockMembers.map(member => ({
    value: member.id,
    label: `${member.name} ${member.role === 'owner' ? '(Leader)' : ''}`
  }));

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Shadcn Form Foundation Test</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditMode(!editMode);
                setSubmitResult(null);
                setFormErrors({});
              }}
            >
              {editMode ? 'Switch to Create Mode' : 'Switch to Edit Mode'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error Display */}
              {formErrors.general && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl" role="alert">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-300">{formErrors.general}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {submitResult?.success && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl" role="alert">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-green-300">{submitResult.message}</p>
                  </div>
                </div>
              )}

              {/* Title Field */}
              <FormField
                control={control}
                name="title"
                label="Task Title"
                placeholder="What needs to be done?"
                required
                maxLength={100}
              />

              {/* Description Field */}
              <FormField
                control={control}
                name="description"
                label="Description"
                type="textarea"
                placeholder="Describe the task details..."
                required
                maxLength={500}
              />

              {/* Priority and Assignment Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="priority"
                  label="Priority"
                  type="select"
                  placeholder="Select priority"
                  options={priorityOptions}
                  required
                />

                <FormField
                  control={control}
                  name="assignedTo"
                  label="Assign To"
                  type="select"
                  placeholder="Select member"
                  options={memberOptions}
                  required
                />
              </div>

              {/* Labels Section */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Labels
                </label>
                
                {/* Label Input */}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      }
                    }}
                    disabled={isSubmitting}
                    className="flex-1 px-3 py-2 text-sm rounded-lg bg-background-sidebar border border-dark-primary/30 text-white placeholder-dark-tertiary focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-50 hover:border-green-500/50 transition-all duration-200"
                    placeholder="Add a label..."
                    maxLength={20}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddLabel}
                    disabled={isSubmitting || !newLabel.trim()}
                  >
                    Add
                  </Button>
                </div>

                {/* Label Display */}
                {formValues.labels?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formValues.labels.map((label, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30"
                      >
                        {label}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeLabel(label)}
                          disabled={isSubmitting}
                          className="ml-2 h-auto p-0 text-primary hover:text-primary/80"
                        >
                          ×
                        </Button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setSubmitResult(null);
                    setFormErrors({});
                  }}
                  disabled={isSubmitting}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="bg-gradient-to-r from-primary to-primary/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner w-4 h-4 mr-2" />
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    editMode ? 'Update Task' : 'Create Task'
                  )}
                </Button>
              </div>

              {/* Form State Debug Info */}
              <div className="mt-6 p-4 bg-gray-800/50 rounded-lg text-xs">
                <h4 className="font-semibold mb-2">Form State (Debug Info):</h4>
                <div className="space-y-1">
                  <div>Valid: {isValid ? '✅' : '❌'}</div>
                  <div>Dirty: {isDirty ? '✅' : '❌'}</div>
                  <div>Submitting: {isSubmitting ? '✅' : '❌'}</div>
                  <div>Mode: {editMode ? 'Edit' : 'Create'}</div>
                  <div>Errors: {Object.keys(errors).length}</div>
                </div>
              </div>

              {/* Form Data Preview */}
              {submitResult?.success && (
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg text-xs">
                  <h4 className="font-semibold mb-2">Submitted Data:</h4>
                  <pre className="text-gray-300 overflow-auto">
                    {JSON.stringify(submitResult.data, null, 2)}
                  </pre>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormFoundationTest;