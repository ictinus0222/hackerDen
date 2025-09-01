import { useMemo } from 'react';

const ProgressBar = ({ 
  completedTasks = 0, 
  totalTasks = 0, 
  showPercentage = true, 
  showLabel = true,
  size = 'md',
  className = '' 
}) => {
  const percentage = useMemo(() => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [completedTasks, totalTasks]);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-primary';
    if (percentage >= 60) return 'bg-accent';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-destructive';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground">
            Task Progress
          </span>
          {showPercentage && (
            <span className="text-xs font-mono text-foreground">
              {percentage}%
            </span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-muted/50 rounded-full overflow-hidden ${sizeClasses[size]} border border-border/30`}>
        <div
          className={`${sizeClasses[size]} rounded-full transition-all duration-500 ease-out ${getProgressColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full bg-gradient-to-r from-transparent to-white/20 rounded-full"></div>
        </div>
      </div>
      
      {showLabel && (
        <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
          {completedTasks} of {totalTasks} completed
        </span>
        <span className="text-xs text-muted-foreground">
          {totalTasks - completedTasks} remaining
        </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;