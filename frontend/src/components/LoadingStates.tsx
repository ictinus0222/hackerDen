import React from 'react';

// Generic loading spinner
export const LoadingSpinner: React.FC<{ 
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div 
      className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};

// Full page loading
export const PageLoading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
);

// Button loading state
export const ButtonLoading: React.FC<{ 
  children: React.ReactNode;
  loading: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, loading, disabled, className = '', onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className={`relative ${className} ${loading || disabled ? 'opacity-75 cursor-not-allowed' : ''}`}
  >
    {loading && (
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner size="sm" />
      </div>
    )}
    <span className={loading ? 'opacity-0' : 'opacity-100'}>
      {children}
    </span>
  </button>
);

// Skeleton components for different content types
export const SkeletonText: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ lines = 1, className = '' }) => (
  <div className={`animate-pulse ${className}`} data-testid="skeleton-text">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`bg-gray-200 rounded h-4 ${index < lines - 1 ? 'mb-2' : ''} ${
          index === lines - 1 ? 'w-3/4' : 'w-full'
        }`}
        data-testid={`skeleton-line-${index}`}
      />
    ))}
  </div>
);

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-white rounded-lg shadow p-6 ${className}`} data-testid="skeleton-card">
    <div className="flex items-center mb-4">
      <div className="bg-gray-200 rounded-full h-10 w-10" />
      <div className="ml-3 flex-1">
        <div className="bg-gray-200 rounded h-4 w-1/2 mb-2" />
        <div className="bg-gray-200 rounded h-3 w-1/4" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

// Project Hub skeleton
export const ProjectHubSkeleton: React.FC = () => (
  <div className="max-w-4xl mx-auto p-6" data-testid="project-hub-skeleton">
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="bg-gray-200 rounded h-8 w-1/3 mb-4" />
        <div className="bg-gray-200 rounded h-4 w-2/3" />
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-gray-200 rounded h-6 w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="bg-gray-200 rounded h-4 w-full" />
            <div className="bg-gray-200 rounded h-4 w-3/4" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="bg-gray-200 rounded h-6 w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="bg-gray-200 rounded h-4 w-full" />
            <div className="bg-gray-200 rounded h-4 w-2/3" />
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="bg-gray-200 rounded h-6 w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded">
              <div className="bg-gray-200 rounded-full h-8 w-8" />
              <div className="ml-3 flex-1">
                <div className="bg-gray-200 rounded h-4 w-2/3 mb-1" />
                <div className="bg-gray-200 rounded h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Task Board skeleton
export const TaskBoardSkeleton: React.FC = () => (
  <div className="p-6" data-testid="task-board-skeleton">
    <div className="animate-pulse">
      {/* Header */}
      <div className="mb-6">
        <div className="bg-gray-200 rounded h-8 w-1/4 mb-2" />
        <div className="bg-gray-200 rounded h-4 w-1/2" />
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, columnIndex) => (
          <div key={columnIndex} className="bg-gray-100 rounded-lg p-4">
            <div className="bg-gray-200 rounded h-6 w-1/2 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 2 + columnIndex }).map((_, cardIndex) => (
                <div key={cardIndex} className="bg-white rounded p-3">
                  <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
                  <div className="bg-gray-200 rounded h-3 w-1/2 mb-2" />
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full h-6 w-6" />
                    <div className="bg-gray-200 rounded h-3 w-1/3 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 4 }) => (
  <div className="animate-pulse space-y-6" data-testid="form-skeleton">
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} data-testid={`form-field-${index}`}>
        <div className="bg-gray-200 rounded h-4 w-1/4 mb-2" />
        <div className="bg-gray-200 rounded h-10 w-full" />
      </div>
    ))}
    <div className="flex space-x-3" data-testid="form-buttons">
      <div className="bg-gray-200 rounded h-10 w-24" />
      <div className="bg-gray-200 rounded h-10 w-20" />
    </div>
  </div>
);

// List skeleton
export const ListSkeleton: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
}> = ({ items = 5, showAvatar = false }) => (
  <div className="animate-pulse space-y-3" data-testid="list-skeleton">
    {Array.from({ length: items }).map((_, index) => (
      <div key={index} className="flex items-center p-3 bg-white rounded-lg shadow" data-testid={`list-item-${index}`}>
        {showAvatar && <div className="bg-gray-200 rounded-full h-10 w-10 mr-3" />}
        <div className="flex-1">
          <div className="bg-gray-200 rounded h-4 w-3/4 mb-2" />
          <div className="bg-gray-200 rounded h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

// Error state component
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
}> = ({ 
  title = 'Something went wrong',
  message = 'Please try again or contact support if the problem persists.',
  onRetry,
  showRetry = true
}) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4">
      <svg
        className="h-12 w-12 text-red-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 mb-6 max-w-md">{message}</p>
    {showRetry && onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Try Again
      </button>
    )}
  </div>
);

// Empty state component
export const EmptyState: React.FC<{
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}> = ({ title, message, action, icon }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="mb-4">
      {icon || (
        <svg
          className="h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m8 0V4a1 1 0 00-1-1H9a1 1 0 00-1 1v1"
          />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    {message && <p className="text-gray-600 mb-6 max-w-md">{message}</p>}
    {action && (
      <button
        onClick={action.onClick}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {action.label}
      </button>
    )}
  </div>
);