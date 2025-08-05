const SkeletonLoader = ({ 
  width = "100%", 
  height = "1rem", 
  className = "",
  rounded = "md" 
}) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  };

  return (
    <div 
      className={`loading-skeleton ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

// Specific skeleton components for common use cases
export const TaskCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
    <div className="flex items-start justify-between mb-2">
      <SkeletonLoader width="70%" height="1.25rem" className="mb-2" />
      <SkeletonLoader width="60px" height="1.5rem" rounded="full" />
    </div>
    <SkeletonLoader width="100%" height="0.875rem" className="mb-1" />
    <SkeletonLoader width="80%" height="0.875rem" className="mb-3" />
    <SkeletonLoader width="50%" height="0.75rem" />
  </div>
);

export const MessageSkeleton = ({ isOwn = false }) => (
  <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs ${isOwn ? 'order-2' : 'order-1'}`}>
      <div className={`px-4 py-2 rounded-lg ${isOwn ? 'rounded-br-none' : 'rounded-bl-none'}`}>
        <SkeletonLoader width="100%" height="1rem" className="mb-1" />
        <SkeletonLoader width="60%" height="1rem" />
      </div>
      <div className={`text-xs mt-1 px-1 ${isOwn ? 'text-right' : 'text-left'}`}>
        <SkeletonLoader width="80px" height="0.75rem" />
      </div>
    </div>
  </div>
);

export const KanbanColumnSkeleton = () => (
  <div className="flex flex-col h-full">
    <div className="bg-gray-50 px-4 py-3 rounded-t-lg border-b border-gray-200">
      <div className="flex items-center justify-between">
        <SkeletonLoader width="80px" height="1rem" />
        <SkeletonLoader width="24px" height="24px" rounded="full" />
      </div>
    </div>
    <div className="flex-1 p-4 bg-gray-50 rounded-b-lg border-l border-r border-b border-gray-300">
      <div className="space-y-3">
        <TaskCardSkeleton />
        <TaskCardSkeleton />
      </div>
    </div>
  </div>
);

export default SkeletonLoader;