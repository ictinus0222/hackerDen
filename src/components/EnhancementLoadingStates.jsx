import { Skeleton } from './ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  FileText, 
  MessageSquare, 
  Trophy, 
  Vote, 
  Upload, 
  Users, 
  BarChart3,
  Clock,
  RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Generic skeleton loader with enhancement-specific styling
 */
export const EnhancementSkeleton = ({ 
  width = "100%", 
  height = "1rem", 
  className = "",
  rounded = "md",
  animate = true
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
      className={cn(
        "bg-muted",
        roundedClasses[rounded],
        animate && "animate-pulse",
        className
      )}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

/**
 * File sharing skeleton components
 */
export const FileCardSkeleton = ({ className }) => (
  <Card className={cn("", className)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <EnhancementSkeleton width="40px" height="40px" rounded="md" />
          <div className="flex-1 space-y-2">
            <EnhancementSkeleton width="70%" height="1rem" />
            <EnhancementSkeleton width="50%" height="0.75rem" />
          </div>
        </div>
        <EnhancementSkeleton width="60px" height="20px" rounded="full" />
      </div>
      <div className="flex items-center justify-between">
        <EnhancementSkeleton width="80px" height="0.75rem" />
        <EnhancementSkeleton width="24px" height="24px" rounded="full" />
      </div>
    </CardContent>
  </Card>
);

export const FileLibrarySkeleton = ({ itemCount = 6, className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" />
        <EnhancementSkeleton width="120px" height="1.5rem" />
      </div>
      <EnhancementSkeleton width="80px" height="32px" rounded="md" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <FileCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

export const FileUploadSkeleton = ({ className }) => (
  <Card className={cn("border-dashed border-2", className)}>
    <CardContent className="p-8">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="p-4 rounded-full bg-muted">
          <Upload className="h-8 w-8 text-muted-foreground animate-pulse" />
        </div>
        <div className="text-center space-y-2">
          <EnhancementSkeleton width="200px" height="1.25rem" className="mx-auto" />
          <EnhancementSkeleton width="150px" height="1rem" className="mx-auto" />
        </div>
        <Progress value={45} className="w-full max-w-xs" />
        <EnhancementSkeleton width="100px" height="0.75rem" />
      </div>
    </CardContent>
  </Card>
);

/**
 * Idea management skeleton components
 */
export const IdeaCardSkeleton = ({ className }) => (
  <Card className={cn("", className)}>
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <EnhancementSkeleton width="80%" height="1.25rem" />
          <EnhancementSkeleton width="100%" height="0.875rem" />
          <EnhancementSkeleton width="60%" height="0.875rem" />
        </div>
        <EnhancementSkeleton width="60px" height="20px" rounded="full" />
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <EnhancementSkeleton width="40px" height="16px" rounded="full" />
          <EnhancementSkeleton width="40px" height="16px" rounded="full" />
        </div>
        <div className="flex items-center gap-2">
          <EnhancementSkeleton width="60px" height="32px" rounded="md" />
          <EnhancementSkeleton width="24px" height="24px" rounded="full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const IdeaBoardSkeleton = ({ itemCount = 8, className }) => (
  <div className={cn("space-y-4", className)}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-muted-foreground" />
        <EnhancementSkeleton width="100px" height="1.5rem" />
      </div>
      <div className="flex items-center gap-2">
        <EnhancementSkeleton width="120px" height="32px" rounded="md" />
        <EnhancementSkeleton width="80px" height="32px" rounded="md" />
      </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Array.from({ length: itemCount }).map((_, index) => (
        <IdeaCardSkeleton key={index} />
      ))}
    </div>
  </div>
);

/**
 * Gamification skeleton components
 */
export const AchievementCardSkeleton = ({ className }) => (
  <Card className={cn("", className)}>
    <CardContent className="p-4">
      <div className="flex items-center gap-3">
        <EnhancementSkeleton width="48px" height="48px" rounded="full" />
        <div className="flex-1 space-y-2">
          <EnhancementSkeleton width="70%" height="1rem" />
          <EnhancementSkeleton width="100%" height="0.75rem" />
          <EnhancementSkeleton width="50%" height="0.75rem" />
        </div>
        <EnhancementSkeleton width="60px" height="20px" rounded="full" />
      </div>
    </CardContent>
  </Card>
);

export const LeaderboardSkeleton = ({ itemCount = 5, className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-muted-foreground" />
        <EnhancementSkeleton width="120px" height="1.5rem" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <EnhancementSkeleton width="24px" height="24px" rounded="full" />
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <EnhancementSkeleton width="100%" height="100%" rounded="full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <EnhancementSkeleton width="60%" height="0.875rem" />
              <EnhancementSkeleton width="40%" height="0.75rem" />
            </div>
            <EnhancementSkeleton width="60px" height="20px" rounded="full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const ProgressBarSkeleton = ({ className }) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center justify-between">
      <EnhancementSkeleton width="100px" height="0.875rem" />
      <EnhancementSkeleton width="40px" height="0.875rem" />
    </div>
    <Progress value={0} className="h-2" />
  </div>
);

/**
 * Polling skeleton components
 */
export const PollCardSkeleton = ({ className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <EnhancementSkeleton width="90%" height="1.25rem" />
          <div className="flex items-center gap-2">
            <EnhancementSkeleton width="60px" height="16px" rounded="full" />
            <EnhancementSkeleton width="80px" height="16px" rounded="full" />
          </div>
        </div>
        <Vote className="h-5 w-5 text-muted-foreground" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <EnhancementSkeleton width="70%" height="0.875rem" />
              <EnhancementSkeleton width="40px" height="0.875rem" />
            </div>
            <Progress value={0} className="h-2" />
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <EnhancementSkeleton width="100px" height="0.75rem" />
          <EnhancementSkeleton width="80px" height="32px" rounded="md" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const PollResultsSkeleton = ({ optionCount = 4, className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-muted-foreground" />
        <EnhancementSkeleton width="150px" height="1.5rem" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: optionCount }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <EnhancementSkeleton width="60%" height="1rem" />
              <div className="flex items-center gap-2">
                <EnhancementSkeleton width="40px" height="0.875rem" />
                <EnhancementSkeleton width="30px" height="0.875rem" />
              </div>
            </div>
            <Progress value={0} className="h-3" />
          </div>
        ))}
        <Separator />
        <div className="flex items-center justify-between">
          <EnhancementSkeleton width="120px" height="0.875rem" />
          <EnhancementSkeleton width="80px" height="0.875rem" />
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Submission skeleton components
 */
export const SubmissionBuilderSkeleton = ({ className }) => (
  <div className={cn("space-y-6", className)}>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-muted-foreground" />
          <EnhancementSkeleton width="150px" height="1.5rem" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <EnhancementSkeleton width="120px" height="1rem" />
            <EnhancementSkeleton width="100%" height="80px" rounded="md" />
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
);

export const TeamContributionsSkeleton = ({ memberCount = 4, className }) => (
  <Card className={cn("", className)}>
    <CardHeader>
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <EnhancementSkeleton width="150px" height="1.5rem" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: memberCount }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                <EnhancementSkeleton width="100%" height="100%" rounded="full" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <EnhancementSkeleton width="60%" height="1rem" />
              <div className="flex items-center gap-2">
                <EnhancementSkeleton width="40px" height="16px" rounded="full" />
                <EnhancementSkeleton width="50px" height="16px" rounded="full" />
                <EnhancementSkeleton width="60px" height="16px" rounded="full" />
              </div>
            </div>
            <EnhancementSkeleton width="80px" height="20px" rounded="full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

/**
 * Loading state with progress and status
 */
export const EnhancementLoadingState = ({
  feature,
  operation,
  progress = 0,
  status = "Loading...",
  showProgress = true,
  icon: IconComponent,
  className
}) => {
  const defaultIcon = RefreshCw;
  const Icon = IconComponent || defaultIcon;

  return (
    <Card className={cn("", className)}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-4 rounded-full bg-muted">
            <Icon className="h-8 w-8 text-muted-foreground animate-spin" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-medium">{operation || `Loading ${feature}`}</h3>
            <p className="text-sm text-muted-foreground">{status}</p>
          </div>
          {showProgress && progress > 0 && (
            <div className="w-full max-w-xs space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * Comprehensive loading state for entire enhancement sections
 */
export const EnhancementSectionSkeleton = ({
  feature,
  itemCount = 6,
  layout = "grid", // grid, list, cards
  className
}) => {
  const getSkeletonComponent = () => {
    switch (feature) {
      case 'files':
        return FileLibrarySkeleton;
      case 'ideas':
        return IdeaBoardSkeleton;
      case 'achievements':
        return () => (
          <div className="space-y-4">
            <LeaderboardSkeleton />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <AchievementCardSkeleton key={index} />
              ))}
            </div>
          </div>
        );
      case 'polls':
        return () => (
          <div className="space-y-4">
            {Array.from({ length: itemCount }).map((_, index) => (
              <PollCardSkeleton key={index} />
            ))}
          </div>
        );
      case 'submissions':
        return SubmissionBuilderSkeleton;
      default:
        return () => (
          <div className={cn(
            layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" :
            layout === 'list' ? "space-y-4" :
            "space-y-4"
          )}>
            {Array.from({ length: itemCount }).map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <EnhancementSkeleton width="70%" height="1.25rem" />
                    <EnhancementSkeleton width="100%" height="0.875rem" />
                    <EnhancementSkeleton width="60%" height="0.875rem" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  const SkeletonComponent = getSkeletonComponent();

  return (
    <div className={cn("", className)}>
      <SkeletonComponent itemCount={itemCount} />
    </div>
  );
};

/**
 * Loading overlay for existing content
 */
export const EnhancementLoadingOverlay = ({
  isLoading,
  operation = "Loading...",
  progress = 0,
  children,
  className
}) => {
  return (
    <div className={cn("relative", className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="max-w-sm w-full mx-4">
            <CardContent className="p-6">
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center space-y-2">
                  <p className="font-medium">{operation}</p>
                  {progress > 0 && (
                    <div className="space-y-2">
                      <Progress value={progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {Math.round(progress)}% complete
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default {
  EnhancementSkeleton,
  FileCardSkeleton,
  FileLibrarySkeleton,
  FileUploadSkeleton,
  IdeaCardSkeleton,
  IdeaBoardSkeleton,
  AchievementCardSkeleton,
  LeaderboardSkeleton,
  ProgressBarSkeleton,
  PollCardSkeleton,
  PollResultsSkeleton,
  SubmissionBuilderSkeleton,
  TeamContributionsSkeleton,
  EnhancementLoadingState,
  EnhancementSectionSkeleton,
  EnhancementLoadingOverlay
};