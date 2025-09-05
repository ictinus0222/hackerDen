import { useState } from 'react';
import { Button } from './ui/button';
import { Smile, Plus } from 'lucide-react';
import ReactionPicker from './ReactionPicker';
import ReactionDisplay from './ReactionDisplay';
import { useReactions } from '../hooks/useReactions';
import { cn } from '../lib/utils';

const ReactionButton = ({ 
  targetId, 
  targetType, 
  teamId,
  className,
  showAddButton = true,
  compact = false
}) => {
  const { reactions, loading, toggleReaction } = useReactions(targetId, targetType);
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const handleReactionAdd = async (reaction) => {
    // The reaction will be updated via real-time subscription
    setIsPickerOpen(false);
  };

  const hasReactions = reactions && reactions.length > 0;

  if (compact && !hasReactions && !showAddButton) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Display existing reactions */}
      <ReactionDisplay
        targetId={targetId}
        targetType={targetType}
        onReactionUpdate={() => {
          // Reactions are updated via the useReactions hook
        }}
      />

      {/* Add reaction button */}
      {showAddButton && (
        <ReactionPicker
          targetId={targetId}
          targetType={targetType}
          teamId={teamId}
          onReactionAdd={handleReactionAdd}
          trigger={
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity",
                hasReactions ? "ml-1" : ""
              )}
              title="Add reaction"
            >
              {hasReactions ? (
                <Plus className="h-3 w-3" />
              ) : (
                <Smile className="h-3 w-3" />
              )}
            </Button>
          }
        />
      )}
    </div>
  );
};

export default ReactionButton;