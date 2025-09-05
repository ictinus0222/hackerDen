import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { reactionService } from '../services/reactionService';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';

const ReactionDisplay = ({ 
  targetId, 
  targetType, 
  onReactionUpdate,
  className 
}) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load reactions on component mount
  useEffect(() => {
    loadReactions();
  }, [targetId, targetType]);

  // Subscribe to real-time reaction updates
  useEffect(() => {
    if (!targetId || !targetType) return;

    const unsubscribe = reactionService.subscribeToReactions(
      targetId,
      targetType,
      (response) => {
        // Reload reactions when there are changes
        loadReactions();
        
        if (onReactionUpdate) {
          onReactionUpdate(response);
        }
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [targetId, targetType, onReactionUpdate]);

  const loadReactions = async () => {
    try {
      setLoading(true);
      const reactionGroups = await reactionService.getReactions(targetId, targetType);
      setReactions(reactionGroups);
    } catch (error) {
      console.error('Failed to load reactions:', error);
      setReactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReactionClick = async (emoji, isCustom) => {
    if (!user?.$id) return;

    try {
      const reaction = await reactionService.addReaction(
        targetId,
        targetType,
        user.$id,
        emoji,
        isCustom
      );

      // Reactions will be updated via real-time subscription
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const getUserNames = (userIds) => {
    // In a real implementation, you'd fetch user names
    // For now, we'll just show user count
    return userIds.map(id => id === user?.$id ? 'You' : 'User').join(', ');
  };

  if (loading) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
        <div className="h-6 w-12 bg-muted animate-pulse rounded-full"></div>
      </div>
    );
  }

  if (!reactions || reactions.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className={cn("flex items-center gap-1 flex-wrap", className)}>
        {reactions.map((reactionGroup) => {
          const userHasReacted = reactionGroup.users.includes(user?.$id);
          const tooltipText = `${getUserNames(reactionGroup.users)} reacted with ${reactionGroup.emoji}`;

          return (
            <Tooltip key={reactionGroup.emoji}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-6 px-2 py-0 text-xs rounded-full transition-all duration-200",
                    "hover:bg-muted/80 hover:scale-105",
                    userHasReacted && "bg-primary/10 border border-primary/20 text-primary"
                  )}
                  onClick={() => handleReactionClick(reactionGroup.emoji, reactionGroup.isCustom)}
                >
                  <span className="flex items-center gap-1">
                    {reactionGroup.isCustom ? (
                      <img
                        src={reactionGroup.emoji}
                        alt="Custom emoji"
                        className="h-3 w-3 object-contain"
                      />
                    ) : (
                      <span className="text-sm">{reactionGroup.emoji}</span>
                    )}
                    <span className="text-xs font-medium">
                      {reactionGroup.count}
                    </span>
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{tooltipText}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default ReactionDisplay;