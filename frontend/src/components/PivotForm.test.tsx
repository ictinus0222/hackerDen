import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PivotForm } from './PivotForm';

describe('PivotForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<PivotForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/what changed/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/why did you pivot/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log pivot/i })).toBeInTheDocument();
  });

  it('shows cancel button when onCancel is provided', () => {
    render(<PivotForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('does not show cancel button when onCancel is not provided', () => {
    render(<PivotForm onSubmit={mockOnSubmit} />);

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('disables submit button when fields are empty', () => {
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /log pivot/i });
    expect(submitButton).toBeDisabled();
  });

  it('enables submit button when both fields have content', async () => {
    const user = userEvent.setup();
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);
    const submitButton = screen.getByRole('button', { name: /log pivot/i });

    await user.type(descriptionField, 'Changed from mobile to web');
    await user.type(reasonField, 'Web development is faster');

    expect(submitButton).not.toBeDisabled();
  });

  it('shows character count for both fields', async () => {
    const user = userEvent.setup();
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    
    expect(screen.getAllByText('0/1000 characters')).toHaveLength(2);
    
    await user.type(descriptionField, 'Test');
    
    expect(screen.getByText('4/1000 characters')).toBeInTheDocument();
  });

  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    // Add some content to enable the button, then clear one field
    await user.type(descriptionField, 'Test description');
    await user.type(reasonField, 'Test reason');
    await user.clear(descriptionField);
    
    const submitButton = screen.getByRole('button', { name: /log pivot/i });
    
    // Force submit by triggering form submit event
    fireEvent.submit(submitButton.closest('form')!);

    expect(screen.getByText(/pivot description is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates field length limits', async () => {
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);
    const longText = 'a'.repeat(1001);

    fireEvent.change(reasonField, { target: { value: 'Valid reason' } });
    fireEvent.change(descriptionField, { target: { value: longText } });
    
    // Force submit by triggering form submit event
    fireEvent.submit(descriptionField.closest('form')!);

    expect(screen.getByText(/description must be less than 1000 characters/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Changed from mobile to web app' } });
    fireEvent.change(reasonField, { target: { value: 'Web development is faster for our team' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'Changed from mobile to web app',
        reason: 'Web development is faster for our team'
      });
    });
  });

  it('resets form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Test description' } });
    fireEvent.change(reasonField, { target: { value: 'Test reason' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(descriptionField).toHaveValue('');
      expect(reasonField).toHaveValue('');
    });
  });

  it('shows loading state during submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockOnSubmit.mockReturnValue(submitPromise);
    
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Test description' } });
    fireEvent.change(reasonField, { target: { value: 'Test reason' } });
    
    // Submit the form
    fireEvent.submit(descriptionField.closest('form')!);

    // Wait for the loading state to appear
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logging pivot/i })).toBeInTheDocument();
    });
    
    expect(descriptionField).toBeDisabled();
    expect(reasonField).toBeDisabled();

    // Resolve the promise
    resolveSubmit!();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /log pivot/i })).toBeInTheDocument();
    });
  });

  it('can be controlled by isLoading prop', () => {
    render(<PivotForm onSubmit={mockOnSubmit} isLoading={true} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);
    const submitButton = screen.getByRole('button', { name: /logging pivot/i });

    expect(descriptionField).toBeDisabled();
    expect(reasonField).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<PivotForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    // Add some content first
    await user.type(descriptionField, 'Test content');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
    expect(descriptionField).toHaveValue('');
  });

  it('trims whitespace from input values', async () => {
    mockOnSubmit.mockResolvedValue(undefined);
    
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: '  Changed from mobile to web app  ' } });
    fireEvent.change(reasonField, { target: { value: '  Web development is faster  ' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        description: 'Changed from mobile to web app',
        reason: 'Web development is faster'
      });
    });
  });

  it('handles submission errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockOnSubmit.mockRejectedValue(new Error('Network error'));
    
    render(<PivotForm onSubmit={mockOnSubmit} />);

    const descriptionField = screen.getByLabelText(/what changed/i);
    const reasonField = screen.getByLabelText(/why did you pivot/i);

    fireEvent.change(descriptionField, { target: { value: 'Test description' } });
    fireEvent.change(reasonField, { target: { value: 'Test reason' } });
    
    fireEvent.submit(descriptionField.closest('form')!);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to log pivot:', expect.any(Error));
    });

    // Form should not be reset on error
    expect(descriptionField).toHaveValue('Test description');
    expect(reasonField).toHaveValue('Test reason');

    consoleErrorSpy.mockRestore();
  });
});