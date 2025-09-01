import { Skeleton } from './ui/skeleton';
import { Card } from './ui/card';
import { cn } from '../lib/utils';

// Enhanced chat loading skeleton with better UX
export const ChatLoadingSkeleton = ({ className }) => (
  <div className={cn("flex-1 flex flex-col", className)} data-testid="chat-skeleton">
    {/* Header skeleton */}
    <div className="border-b border-border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
    
    {/* Messages skeleton */}
    <div className="flex-1 p-4 space-y-4 overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <MessageSkeleton key={i} variant={i % 3 === 0 ? 'system' : 'user'} />
      ))}
    </div>
    
    {/* Input skeleton */}
    <div className="border-t border-border p-4">
      <div className="flex gap-2">
        <Skeleton className="flex-1 h-11 rounded-lg" />
        <Skeleton className="h-11 w-20 rounded-lg" />
      </div>
    </div>
  </div>
);

// Individual message skeleton with variants
export const MessageSkeleton = ({ variant = 'user', className }) => {
  if (variant === 'system') {
    return (
      <div className={cn("flex justify-center", className)}>
        <Card className="px-3 py-2 bg-muted/50">
          <div className="flex items-center space-x-2">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-3 w-40" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex space-x-3", className)}>
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {Math.random() > 0.5 && <Skeleton className="h-4 w-1/2" />}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton for message history
export const MessageHistoryLoadingSkeleton = ({ count = 3, className }) => (
  <div className={cn("space-y-4 p-4", className)}>
    <div className="flex justify-center">
      <Skeleton className="h-6 w-32 rounded-full" />
    </div>
    {[...Array(count)].map((_, i) => (
      <MessageSkeleton key={i} />
    ))}
  </div>
);

// Loading skeleton for typing indicators
export const TypingIndicatorSkeleton = ({ className }) => (
  <div className={cn("flex space-x-3 p-4", className)}>
    <Skeleton className="w-8 h-8 rounded-full" />
    <div className="flex-1">
      <div className="flex items-center space-x-1">
        <Skeleton className="w-2 h-2 rounded-full animate-pulse" />
        <Skeleton className="w-2 h-2 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <Skeleton className="w-2 h-2 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

// Connection status loading skeleton
export const ConnectionStatusSkeleton = ({ className }) => (
  <div className={cn("flex items-center space-x-2", className)}>
    <Skeleton className="w-2 h-2 rounded-full animate-pulse" />
    <Skeleton className="h-3 w-16" />
  </div>
);

// Comprehensive loading state for entire chat initialization
export const ChatInitializationSkeleton = ({ className }) => (
  <div className={cn("flex-1 flex flex-col animate-pulse", className)}>
    {/* Navigation skeleton */}
    <div className="p-4 border-b border-border">
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-12" />
      </div>
    </div>

    {/* Main chat skeleton */}
    <ChatLoadingSkeleton className="flex-1" />
    
    {/* Status bar skeleton */}
    <div className="border-t border-border p-2 flex justify-between items-center">
      <ConnectionStatusSkeleton />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// Loading state for failed message retry
export const RetryLoadingSkeleton = ({ className }) => (
  <div className={cn("flex items-center space-x-2 text-muted-foreground", className)}>
    <Skeleton className="w-4 h-4 rounded animate-spin" />
    <Skeleton className="h-3 w-16" />
  </div>
);