import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useTaskForm } from '../hooks/useTaskForm';
import { taskValidationSchema, transformTaskFormData, populateTaskForm } from '../lib/form-validation';

// Test the form validation utilities
describe('Form Validation Utilities', () => {
  it('should validate required fields correctly', () => {
    const schema = taskValidationSchema;
    
    expect(schema.title.required.value).toBe(true);
    expect(schema.description.required.value).toBe(true);
    expect(schema.priority.required.value).toBe(true);
    expect(schema.assignedTo.required.value).toBe(true);
  });

  it('should transform form data correctly', () => {
    const formData = {
      title: 'Test Task',
      description: 'Test Description',
      priority: 'high',
      labels: ['test'],
      assignedTo: 'user-123'
    };

    const user = { name: 'Test User' };
    const members = [{ id: 'user-123', name: 'Assigned User' }];

    const result = transformTaskFormData(formData, user, members);

    expect(result).toEqual({
      title: 'Test Task',
      description: 'Test Description',
      assignedTo: 'user-123',
      assigned_to: 'Assigned User',
      priority: 'high',
      labels: ['test']
    });
  });

  it('should populate form with task data correctly', () => {
    const task = {
      title: 'Existing Task',
      description: 'Existing Description',
      priority: 'medium',
      labels: ['existing'],
      assignedTo: 'user-456'
    };

    const result = populateTaskForm(task, 'user-123');

    expect(result).toEqual({
      title: 'Existing Task',
      description: 'Existing Description',
      priority: 'medium',
      labels: ['existing'],
      assignedTo: 'user-456'
    });
  });
});

// Mock component to test the useTaskForm hook
const TestFormComponent = ({ editTask, user, members, onSubmit, onError }) => {
  const {
    control,
    formValues,
    isValid,
    handleSubmit,
    addLabel,
    removeLabel
  } = useTaskForm({
    editTask,
    user,
    members,
    onSubmit,
    onError
  });

  return (
    <div>
      <div data-testid="form-values">{JSON.stringify(formValues)}</div>
      <div data-testid="is-valid">{isValid.toString()}</div>
      <button onClick={() => addLabel('test-label')} data-testid="add-label">
        Add Label
      </button>
      <button onClick={() => removeLabel('test-label')} data-testid="remove-label">
        Remove Label
      </button>
      <form onSubmit={handleSubmit} data-testid="form">
        <button type="submit" data-testid="submit">Submit</button>
      </form>
    </div>
  );
};

describe('useTaskForm Hook', () => {
  const mockUser = { $id: 'user-123', name: 'Test User' };
  const mockMembers = [
    { id: 'user-123', name: 'Test User' },
    { id: 'user-456', name: 'Other User' }
  ];

  it('should initialize with default values for new task', () => {
    const mockOnSubmit = vi.fn();
    const mockOnError = vi.fn();

    render(
      <TestFormComponent
        user={mockUser}
        members={mockMembers}
        onSubmit={mockOnSubmit}
        onError={mockOnError}
      />
    );

    const formValues = JSON.parse(screen.getByTestId('form-values').textContent);
    
    expect(formValues.title).toBe('');
    expect(formValues.description).toBe('');
    expect(formValues.priority).toBe('medium');
    expect(formValues.assignedTo).toBe('user-123');
    expect(formValues.labels).toEqual([]);
  });

  it('should populate form with edit task data', () => {
    const editTask = {
      title: 'Edit Task',
      description: 'Edit Description',
      priority: 'high',
      labels: ['edit'],
      assignedTo: 'user-456'
    };

    const mockOnSubmit = vi.fn();
    const mockOnError = vi.fn();

    render(
      <TestFormComponent
        editTask={editTask}
        user={mockUser}
        members={mockMembers}
        onSubmit={mockOnSubmit}
        onError={mockOnError}
      />
    );

    const formValues = JSON.parse(screen.getByTestId('form-values').textContent);
    
    expect(formValues.title).toBe('Edit Task');
    expect(formValues.description).toBe('Edit Description');
    expect(formValues.priority).toBe('high');
    expect(formValues.assignedTo).toBe('user-456');
    expect(formValues.labels).toEqual(['edit']);
  });

  it('should handle label addition and removal', async () => {
    const mockOnSubmit = vi.fn();
    const mockOnError = vi.fn();

    render(
      <TestFormComponent
        user={mockUser}
        members={mockMembers}
        onSubmit={mockOnSubmit}
        onError={mockOnError}
      />
    );

    // Add a label
    fireEvent.click(screen.getByTestId('add-label'));

    await waitFor(() => {
      const formValues = JSON.parse(screen.getByTestId('form-values').textContent);
      expect(formValues.labels).toContain('test-label');
    });

    // Remove the label
    fireEvent.click(screen.getByTestId('remove-label'));

    await waitFor(() => {
      const formValues = JSON.parse(screen.getByTestId('form-values').textContent);
      expect(formValues.labels).not.toContain('test-label');
    });
  });
});

describe('Form Foundation Integration', () => {
  it('should export all required form components', async () => {
    // Test that all form components can be imported
    const { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } = await import('../components/ui/form');
    const { FormField: CustomFormField } = await import('../components/ui/form-field');
    const { Label } = await import('../components/ui/label');
    const { Textarea } = await import('../components/ui/textarea');
    const { Select } = await import('../components/ui/select');

    expect(Form).toBeDefined();
    expect(FormField).toBeDefined();
    expect(FormItem).toBeDefined();
    expect(FormLabel).toBeDefined();
    expect(FormControl).toBeDefined();
    expect(FormMessage).toBeDefined();
    expect(CustomFormField).toBeDefined();
    expect(Label).toBeDefined();
    expect(Textarea).toBeDefined();
    expect(Select).toBeDefined();
  });

  it('should have proper validation rules', () => {
    const { validationRules } = require('../lib/form-validation');

    expect(validationRules.required).toBeDefined();
    expect(validationRules.minLength).toBeDefined();
    expect(validationRules.maxLength).toBeDefined();
    expect(validationRules.email).toBeDefined();
    expect(validationRules.noWhitespace).toBeDefined();
  });
});