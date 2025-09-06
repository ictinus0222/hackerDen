import React from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

const ProgressBar = ({ 
  completedTasks, 
  totalTasks, 
  size = 'md', 
  showLabel = true, 
  showPercentage = true,
  className = ''
}) => {
  const percentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Progress</span>
          {showPercentage && (
            <Badge variant="outline" className="text-xs">
              {completedTasks}/{totalTasks} ({percentage}%)
            </Badge>
          )}
        </div>
      )}
      <Progress 
        value={percentage} 
        className={`w-full ${sizeClasses[size]}`}
        aria-label={`Task completion: ${percentage}%`}
      />
      {!showLabel && showPercentage && (
        <div className="text-center">
          <span className="text-xs text-muted-foreground">
            {percentage}% Complete
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;

