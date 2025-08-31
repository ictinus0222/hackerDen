# Shadcn Form Foundation Documentation

## Overview

The Shadcn Form Foundation provides a comprehensive, accessible, and maintainable form system for the HackerDen application. It integrates Shadcn UI components with React Hook Form to create a powerful form management solution that maintains the existing theme and design patterns.

## Key Features

- **Shadcn UI Integration**: Uses official Shadcn components for consistent design
- **React Hook Form**: Powerful form validation and state management
- **Accessibility**: Full WCAG compliance with proper ARIA labels and keyboard navigation
- **Theme Integration**: Seamlessly works with existing CSS custom properties
- **Reusable Components**: Modular design for easy maintenance and extension
- **Comprehensive Validation**: Built-in validation rules and error handling
- **TypeScript Ready**: Full TypeScript support (can be easily converted)

## Components

### Core Form Components

#### `Form`
The main form provider component from Shadcn UI that wraps React Hook Form's FormProvider.

```jsx
import { Form } from './ui/form';
import { useForm } from 'react-hook-form';

const MyComponent = () => {
  const form = useForm();
  
  return (
    <Form {...form}>
      {/* Form content */}
    </Form>
  );
};
```

#### `FormField`
A reusable form field component that handles different input types with consistent styling and validation.

```jsx
import { FormField } from './ui/form-field';

<FormField
  control={control}
  name="title"
  label="Task Title"
  placeholder="Enter task title"
  required
  type="text"
/>

<FormField
  control={control}
  name="description"
  label="Description"
  type="textarea"
  placeholder="Enter description"
/>

<FormField
  control={control}
  name="priority"
  label="Priority"
  type="select"
  options={priorityOptions}
  placeholder="Select priority"
/>
```

#### Supported Field Types

- `text` (default): Standard text input
- `textarea`: Multi-line text input
- `select`: Dropdown selection
- `email`: Email input with validation
- `password`: Password input
- `number`: Numeric input

### Form Validation

#### `taskValidationSchema`
Pre-defined validation rules for task forms:

```jsx
import { taskValidationSchema } from '../lib/form-validation';

// Usage with react-hook-form
const form = useForm({
  defaultValues: taskFormDefaults,
  // Apply validation rules manually or use resolver
});
```

#### `validationRules`
Reusable validation rule builders:

```jsx
import { validationRules } from '../lib/form-validation';

const customValidation = {
  title: {
    ...validationRules.required("Title is required"),
    ...validationRules.maxLength(100, "Title too long")
  }
};
```

### Custom Hook: `useTaskForm`

A comprehensive hook that manages task form state, validation, and submission:

```jsx
import { useTaskForm } from '../hooks/useTaskForm';

const TaskFormComponent = ({ editTask, user, members }) => {
  const {
    form,
    control,
    formValues,
    isValid,
    isSubmitting,
    handleSubmit,
    addLabel,
    removeLabel
  } = useTaskForm({
    editTask,
    user,
    members,
    onSubmit: async (data) => {
      // Handle form submission
    },
    onError: (error) => {
      // Handle errors
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit}>
        <FormField
          control={control}
          name="title"
          label="Title"
          required
        />
        {/* More fields */}
      </form>
    </Form>
  );
};
```

## Usage Examples

### Basic Task Form

```jsx
import React from 'react';
import { useTaskForm } from '../hooks/useTaskForm';
import { Form, FormField, Button } from './ui';
import { priorityOptions } from '../lib/form-validation';

const TaskForm = ({ editTask, user, members, onSubmit }) => {
  const {
    form,
    control,
    handleSubmit,
    isSubmitting,
    isValid
  } = useTaskForm({
    editTask,
    user,
    members,
    onSubmit,
    onError: (error) => console.error(error)
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={control}
          name="title"
          label="Task Title"
          placeholder="What needs to be done?"
          required
        />

        <FormField
          control={control}
          name="description"
          label="Description"
          type="textarea"
          placeholder="Describe the task..."
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={control}
            name="priority"
            label="Priority"
            type="select"
            options={priorityOptions}
            required
          />

          <FormField
            control={control}
            name="assignedTo"
            label="Assign To"
            type="select"
            options={memberOptions}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Saving...' : 'Save Task'}
        </Button>
      </form>
    </Form>
  );
};
```

### Custom Validation

```jsx
import { useForm } from 'react-hook-form';
import { validationRules } from '../lib/form-validation';

const CustomForm = () => {
  const form = useForm({
    defaultValues: {
      email: '',
      username: ''
    }
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        label="Email"
        type="email"
        rules={{
          ...validationRules.required("Email is required"),
          ...validationRules.email()
        }}
      />

      <FormField
        control={form.control}
        name="username"
        label="Username"
        rules={{
          ...validationRules.required("Username is required"),
          ...validationRules.minLength(3, "Username must be at least 3 characters")
        }}
      />
    </Form>
  );
};
```

## Accessibility Features

### Keyboard Navigation
- All form fields are keyboard accessible
- Proper tab order maintained
- Enter key submits forms
- Escape key can close modals

### Screen Reader Support
- Proper ARIA labels and descriptions
- Error messages are announced
- Required fields are clearly marked
- Form validation state is communicated

### Visual Accessibility
- High contrast focus indicators
- Error states with color and text
- Consistent visual hierarchy
- Responsive design for all screen sizes

## Theme Integration

The form components automatically integrate with the existing HackerDen theme:

```css
/* Existing CSS custom properties are used */
--background-sidebar: /* Form field backgrounds */
--border: /* Form field borders */
--primary: /* Focus states and accents */
--foreground: /* Text colors */
--muted-foreground: /* Placeholder text */
--destructive: /* Error states */
```

## Error Handling

### Field-Level Errors
```jsx
<FormField
  control={control}
  name="title"
  label="Title"
  // Errors are automatically displayed below the field
/>
```

### Form-Level Errors
```jsx
const { formErrors } = useTaskForm({
  onError: (error) => {
    // Handle general form errors
    setFormErrors(error);
  }
});

// Display general errors
{formErrors.general && (
  <div className="error-alert">
    {formErrors.general}
  </div>
)}
```

## Performance Considerations

- Form validation runs on change for immediate feedback
- Debounced validation for expensive operations
- Memoized form components prevent unnecessary re-renders
- Lazy loading for complex form sections

## Testing

The form foundation includes comprehensive tests:

```bash
# Run form foundation tests
npm test -- src/test/form-foundation.test.jsx

# Run all form-related tests
npm test -- --testNamePattern="form"
```

## Migration Guide

### From Custom Forms to Shadcn Forms

1. **Replace form elements**:
   ```jsx
   // Before
   <input className="custom-input" />
   
   // After
   <FormField control={control} name="field" />
   ```

2. **Update validation**:
   ```jsx
   // Before
   const [errors, setErrors] = useState({});
   
   // After
   const { formState: { errors } } = useForm();
   ```

3. **Migrate submission handling**:
   ```jsx
   // Before
   const handleSubmit = (e) => {
     e.preventDefault();
     // Manual validation and submission
   };
   
   // After
   const { handleSubmit } = useTaskForm({
     onSubmit: async (data) => {
       // Automatic validation and submission
     }
   });
   ```

## Best Practices

1. **Use the useTaskForm hook** for task-related forms
2. **Leverage FormField component** for consistent styling
3. **Implement proper error handling** at both field and form levels
4. **Test accessibility** with keyboard navigation and screen readers
5. **Follow validation patterns** established in the validation library
6. **Maintain theme consistency** by using existing CSS custom properties

## Future Enhancements

- [ ] Add more field types (date, file upload, etc.)
- [ ] Implement form wizards/multi-step forms
- [ ] Add form auto-save functionality
- [ ] Create form builder for dynamic forms
- [ ] Add advanced validation rules (async validation, cross-field validation)
- [ ] Implement form analytics and user behavior tracking