/**
 * @fileoverview Enhanced ProgressBar Component
 * Uses shadcn/ui Progress component with gamification features
 */

import React, { useMemo } from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

const ProgressBar = ({ 
  completedTasks = 0, 
  totalTasks = 0, 
  showPercentage = true, 
  showLabel = true,
  showBadge = false,
  size = 'md',
  variant = 'default',
  className = '',
  label = 'Task Progress',
  // Gamification props
  points = null,
  maxPoints = null,
  showPoints = false,
  animated = true
}) => {
  const percentage = useMemo(() => {
    if (showPoints && points !== null && maxPoints !== null) {
      if (maxPoints === 0) return 0;
      return Math.round((points / maxPoints) * 100);
    }
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  }, [completedTasks, totalTasks, points, maxPoints, showPoints]);

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  const getVariantColor = (percentage, variant) => {
    if (variant === 'success') return 'bg-green-500';
    if (variant === 'warning') return 'bg-yellow-500';
    if (variant === 'danger') return 'bg-red-500';
    
    // Default dynamic coloring
    if (percentage >= 80) return 'bg-primary';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    if (percentage >= 20) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getBadgeVariant = (percentage) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    if (percentage >= 40) return 'outline';
    return 'destructive';
  };

  const displayValue = showPoints && points !== null ? points : completedTasks;
  const displayMax = showPoints && maxPoints !== null ? maxPoints : totalTasks;
  const displayRemaining = displayMax - displayValue;

  return (
    <div className={cn("w-full space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {label}
          </span>
          <div className="flex items-center gap-2">
            {showPercentage && (
              <span className="text-sm font-mono text-foreground">
                {percentage}%
              </span>
            )}
            {showBadge && (
              <Badge variant={getBadgeVariant(percentage)} className="text-xs">
                {showPoints ? `${points} pts` : `${completedTasks}/${totalTasks}`}
              </Badge>
            )}
          </div>
        </div>
      )}
      
      <Progress 
        value={percentage} 
        className={cn(
          sizeClasses[size],
          animated && "transition-all duration-700 ease-out"
        )}
      />
      
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {showPoints 
              ? `${points || 0} of ${maxPoints || 0} points`
              : `${completedTasks} of ${totalTasks} completed`
            }
          </span>
          {displayRemaining > 0 && (
            <span>
              {showPoints 
                ? `${displayRemaining} points remaining`
                : `${displayRemaining} remaining`
              }
            </span>
          )}
        </div>
      )}
    </div>
  );
};

// Specialized progress bars for gamification
export const PointsProgressBar = ({ points, maxPoints, label = "Points Progress", ...props }) => (
  <ProgressBar 
    points={points}
    maxPoints={maxPoints}
    showPoints={true}
    label={label}
    {...props}
  />
);

export const AchievementProgressBar = ({ current, target, label, ...props }) => (
  <ProgressBar 
    completedTasks={current}
    totalTasks={target}
    label={label}
    showBadge={true}
    variant="success"
    {...props}
  />
);

export const TeamProgressBar = ({ teamPoints, targetPoints, ...props }) => (
  <ProgressBar 
    points={teamPoints}
    maxPoints={targetPoints}
    showPoints={true}
    label="Team Progress"
    size="lg"
    showBadge={true}
    {...props}
  />
);

export default ProgressBar;