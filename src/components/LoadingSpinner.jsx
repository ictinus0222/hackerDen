const LoadingSpinner = ({ 
  message = "Loading...", 
  size = "md", 
  className = "",
  showMessage = true 
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`} role="status" aria-live="polite">
      <div 
        className={`spinner ${size === 'lg' ? 'spinner-lg' : ''} ${sizeClasses[size]} text-blue-600 mb-2`}
        aria-hidden="true"
      />
      {showMessage && (
        <p className="text-gray-600 text-sm" id="loading-message">
          {message}
        </p>
      )}
      <span className="sr-only">{message}</span>
    </div>
  );
};

export default LoadingSpinner;