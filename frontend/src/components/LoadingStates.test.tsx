import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  LoadingSpinner,
  PageLoading,
  ButtonLoading,
  SkeletonText,
  SkeletonCard,
  ProjectHubSkeleton,
  TaskBoardSkeleton,
  FormSkeleton,
  ListSkeleton,
  ErrorState,
  EmptyState
} from './LoadingStates';

describe('LoadingSpinner', () => {
  it('renders with default size', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-class" />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('custom-class');
  });
});

describe('PageLoading', () => {
  it('renders with default message', () => {
    render(<PageLoading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom message', () => {
    render(<PageLoading message="Please wait..." />);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('includes loading spinner', () => {
    render(<PageLoading />);
    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });
});

describe('ButtonLoading', () => {
  it('renders children when not loading', () => {
    render(
      <ButtonLoading loading={false}>
        Click me
      </ButtonLoading>
    );
    
    expect(screen.getByText('Click me')).toHaveClass('opacity-100');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows spinner when loading', () => {
    render(
      <ButtonLoading loading={true}>
        Click me
      </ButtonLoading>
    );
    
    expect(screen.getByText('Click me')).toHaveClass('opacity-0');
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('is disabled when loading', () => {
    render(
      <ButtonLoading loading={true}>
        Click me
      </ButtonLoading>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-75', 'cursor-not-allowed');
  });

  it('is disabled when disabled prop is true', () => {
    render(
      <ButtonLoading loading={false} disabled={true}>
        Click me
      </ButtonLoading>
    );
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls onClick when not loading or disabled', () => {
    const onClick = vi.fn();
    render(
      <ButtonLoading loading={false} onClick={onClick}>
        Click me
      </ButtonLoading>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const onClick = vi.fn();
    render(
      <ButtonLoading loading={true} onClick={onClick}>
        Click me
      </ButtonLoading>
    );
    
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <ButtonLoading loading={false} className="custom-button">
        Click me
      </ButtonLoading>
    );
    
    expect(screen.getByRole('button')).toHaveClass('custom-button');
  });

  it('supports different button types', () => {
    render(
      <ButtonLoading loading={false} type="submit">
        Submit
      </ButtonLoading>
    );
    
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});

describe('SkeletonText', () => {
  it('renders single line by default', () => {
    render(<SkeletonText />);
    const lines = screen.getAllByTestId(/skeleton-line-/);
    expect(lines).toHaveLength(1);
  });

  it('renders multiple lines', () => {
    render(<SkeletonText lines={3} />);
    const lines = screen.getAllByTestId(/skeleton-line-/);
    expect(lines).toHaveLength(3);
  });

  it('applies custom className', () => {
    render(<SkeletonText className="custom-skeleton" />);
    const container = screen.getByTestId('skeleton-text');
    expect(container).toHaveClass('custom-skeleton');
  });
});

describe('SkeletonCard', () => {
  it('renders skeleton card structure', () => {
    render(<SkeletonCard />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow', 'p-6');
  });

  it('applies custom className', () => {
    render(<SkeletonCard className="custom-card" />);
    const card = screen.getByTestId('skeleton-card');
    expect(card).toHaveClass('custom-card');
  });
});

describe('ProjectHubSkeleton', () => {
  it('renders project hub skeleton structure', () => {
    render(<ProjectHubSkeleton />);
    const container = screen.getByTestId('project-hub-skeleton');
    expect(container).toHaveClass('max-w-4xl', 'mx-auto', 'p-6');
  });
});

describe('TaskBoardSkeleton', () => {
  it('renders task board skeleton structure', () => {
    render(<TaskBoardSkeleton />);
    const container = screen.getByTestId('task-board-skeleton');
    expect(container).toHaveClass('p-6');
  });
});

describe('FormSkeleton', () => {
  it('renders default number of fields', () => {
    render(<FormSkeleton />);
    const fields = screen.getAllByTestId(/form-field-/);
    expect(fields).toHaveLength(4);
    expect(screen.getByTestId('form-buttons')).toBeInTheDocument();
  });

  it('renders custom number of fields', () => {
    render(<FormSkeleton fields={2} />);
    const fields = screen.getAllByTestId(/form-field-/);
    expect(fields).toHaveLength(2);
    expect(screen.getByTestId('form-buttons')).toBeInTheDocument();
  });
});

describe('ListSkeleton', () => {
  it('renders default number of items', () => {
    render(<ListSkeleton />);
    const items = screen.getAllByTestId(/list-item-/);
    expect(items).toHaveLength(5);
  });

  it('renders custom number of items', () => {
    render(<ListSkeleton items={3} />);
    const items = screen.getAllByTestId(/list-item-/);
    expect(items).toHaveLength(3);
  });

  it('shows avatars when requested', () => {
    render(<ListSkeleton showAvatar={true} />);
    // Check for rounded-full class which indicates avatar
    const avatars = document.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
  });
});

describe('ErrorState', () => {
  it('renders with default props', () => {
    render(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/Please try again or contact support/)).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorState 
        title="Custom Error" 
        message="Custom error message" 
      />
    );
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows retry button by default', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('hides retry button when showRetry is false', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} showRetry={false} />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState onRetry={onRetry} />);
    
    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalled();
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<ErrorState />);
    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders with required props', () => {
    render(<EmptyState title="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders with message', () => {
    render(
      <EmptyState 
        title="No items" 
        message="Add some items to get started" 
      />
    );
    expect(screen.getByText('Add some items to get started')).toBeInTheDocument();
  });

  it('renders with action button', () => {
    const onClick = vi.fn();
    render(
      <EmptyState 
        title="No items" 
        action={{ label: 'Add Item', onClick }} 
      />
    );
    
    const button = screen.getByText('Add Item');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });

  it('renders with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Custom Icon</div>;
    render(
      <EmptyState 
        title="No items" 
        icon={customIcon} 
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('renders default icon when no custom icon provided', () => {
    render(<EmptyState title="No items" />);
    // Check for SVG element (default icon)
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});