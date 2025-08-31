import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import { 
  InputField, 
  SearchInput, 
  PasswordInput, 
  TextareaField, 
  SelectField,
  CheckboxField,
  RadioField 
} from '../components/ui';

describe('Shadcn Input Components', () => {
  describe('InputField', () => {
    it('renders with label and handles input correctly', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <InputField
          label="Test Input"
          name="test"
          value=""
          onChange={handleChange}
          placeholder="Enter text"
        />
      );
      
      const input = screen.getByLabelText('Test Input');
      const label = screen.getByText('Test Input');
      
      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('placeholder', 'Enter text');
      
      await user.type(input, 'Hello World');
      expect(handleChange).toHaveBeenCalled();
    });

    it('displays error message when error prop is provided', () => {
      render(
        <InputField
          label="Test Input"
          name="test"
          error="This field is required"
        />
      );
      
      const errorMessage = screen.getByText('This field is required');
      const input = screen.getByLabelText('Test Input');
      
      expect(errorMessage).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('shows required indicator when required prop is true', () => {
      render(
        <InputField
          label="Required Field"
          name="test"
          required
        />
      );
      
      const requiredIndicator = screen.getByText('*');
      expect(requiredIndicator).toBeInTheDocument();
    });

    it('supports different variants', () => {
      const { rerender } = render(
        <InputField
          label="Test Input"
          name="test"
          variant="large"
        />
      );
      
      let input = screen.getByLabelText('Test Input');
      expect(input).toHaveClass('h-12');
      
      rerender(
        <InputField
          label="Test Input"
          name="test"
          variant="compact"
        />
      );
      
      input = screen.getByLabelText('Test Input');
      expect(input).toHaveClass('h-8');
    });
  });

  describe('SearchInput', () => {
    it('renders search icon and clear button', async () => {
      const user = userEvent.setup();
      const handleClear = vi.fn();
      
      render(
        <SearchInput
          value="test search"
          onClear={handleClear}
          placeholder="Search..."
        />
      );
      
      const input = screen.getByPlaceholderText('Search...');
      const clearButton = screen.getByLabelText('Clear search');
      
      expect(input).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
      
      await user.click(clearButton);
      expect(handleClear).toHaveBeenCalled();
    });

    it('hides clear button when input is empty', () => {
      render(
        <SearchInput
          value=""
          placeholder="Search..."
        />
      );
      
      const clearButton = screen.queryByLabelText('Clear search');
      expect(clearButton).not.toBeInTheDocument();
    });
  });

  describe('PasswordInput', () => {
    it('toggles password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <PasswordInput
          placeholder="Enter password"
        />
      );
      
      const input = screen.getByPlaceholderText('Enter password');
      const toggleButton = screen.getByLabelText('Show password');
      
      expect(input).toHaveAttribute('type', 'password');
      
      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Hide password')).toBeInTheDocument();
      
      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('TextareaField', () => {
    it('shows character count when enabled', () => {
      render(
        <TextareaField
          label="Description"
          name="description"
          value="Hello"
          maxLength={100}
          showCharCount
        />
      );
      
      const charCount = screen.getByText('5/100');
      expect(charCount).toBeInTheDocument();
    });

    it('shows warning color when near character limit', () => {
      const longText = 'a'.repeat(85); // 85% of 100
      render(
        <TextareaField
          label="Description"
          name="description"
          value={longText}
          maxLength={100}
          showCharCount
        />
      );
      
      const charCount = screen.getByText('85/100');
      expect(charCount).toHaveClass('text-yellow-600');
    });

    it('shows error color when over character limit', () => {
      const longText = 'a'.repeat(105); // Over 100
      render(
        <TextareaField
          label="Description"
          name="description"
          value={longText}
          maxLength={100}
          showCharCount
        />
      );
      
      const charCount = screen.getByText('105/100');
      expect(charCount).toHaveClass('text-destructive');
    });
  });

  describe('CheckboxField', () => {
    it('handles checkbox state changes', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      
      render(
        <CheckboxField
          label="Accept terms"
          checked={false}
          onCheckedChange={handleChange}
        />
      );
      
      const checkbox = screen.getByLabelText('Accept terms');
      
      await user.click(checkbox);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('displays description text', () => {
      render(
        <CheckboxField
          label="Accept terms"
          description="Please read and accept our terms of service"
        />
      );
      
      const description = screen.getByText('Please read and accept our terms of service');
      expect(description).toBeInTheDocument();
    });
  });

  describe('RadioField', () => {
    it('renders radio options correctly', () => {
      const options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ];
      
      render(
        <RadioField
          label="Choose option"
          options={options}
          value="option1"
        />
      );
      
      expect(screen.getByText('Choose option')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 1')).toBeInTheDocument();
      expect(screen.getByLabelText('Option 2')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('associates labels with inputs correctly', () => {
      render(
        <InputField
          label="Email Address"
          name="email"
          type="email"
        />
      );
      
      const input = screen.getByLabelText('Email Address');
      const label = screen.getByText('Email Address');
      
      expect(input).toHaveAttribute('id');
      expect(label).toHaveAttribute('for', input.getAttribute('id'));
    });

    it('associates error messages with inputs', () => {
      render(
        <InputField
          label="Email Address"
          name="email"
          error="Invalid email format"
        />
      );
      
      const input = screen.getByLabelText('Email Address');
      const errorMessage = screen.getByText('Invalid email format');
      
      expect(input).toHaveAttribute('aria-describedby');
      expect(errorMessage).toHaveAttribute('id', input.getAttribute('aria-describedby'));
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <InputField label="First Input" name="first" />
          <InputField label="Second Input" name="second" />
        </div>
      );
      
      const firstInput = screen.getByLabelText('First Input');
      const secondInput = screen.getByLabelText('Second Input');
      
      firstInput.focus();
      expect(firstInput).toHaveFocus();
      
      await user.tab();
      expect(secondInput).toHaveFocus();
    });

    it('provides proper ARIA attributes for required fields', () => {
      render(
        <InputField
          label="Required Field"
          name="test"
          required
        />
      );
      
      const input = screen.getByRole('textbox', { name: /required field/i });
      expect(input).toHaveAttribute('required');
    });
  });

  describe('Mobile Optimization', () => {
    it('uses appropriate input types for mobile keyboards', () => {
      render(
        <div>
          <InputField label="Email" name="email" type="email" />
          <InputField label="Phone" name="phone" type="tel" />
          <InputField label="Number" name="number" type="number" />
        </div>
      );
      
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Phone')).toHaveAttribute('type', 'tel');
      expect(screen.getByLabelText('Number')).toHaveAttribute('type', 'number');
    });

    it('provides large touch targets for mobile', () => {
      render(
        <InputField
          label="Mobile Input"
          name="mobile"
          variant="large"
        />
      );
      
      const input = screen.getByLabelText('Mobile Input');
      expect(input).toHaveClass('h-12'); // 48px height for touch targets
    });
  });
});