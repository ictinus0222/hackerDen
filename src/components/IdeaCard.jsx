import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { 
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from './ui/card';

const IdeaCard = ({ 
  idea, 
  hasUserVoted, 
  onVote, 
  onStatusChange, 
  canChangeStatus, 
  currentUser 
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleVote = async () => {
    if (hasUserVoted || isVoting) return;
    
    setIsVoting(true);
    try {
      await onVote();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (isChangingStatus) return;
    
    setIsChangingStatus(true);
    try {
      await onStatusChange(newStatus);
    } catch (error) {
      console.error('Error changing status:', error);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      case 'approved':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'rejected':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return '💡';
      case 'approved':
        return '✅';
      case 'in_progress':
        return '🔄';
      case 'completed':
        return '🎉';
      case 'rejected':
        return '❌';
      default:
        return '💡';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwnIdea = idea.createdBy === currentUser?.$id;

  return (
    <Card className="bg-[#1E2B29] border-dark-primary/20 hover:border-blue-500/30 transition-all duration-200 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">
            {idea.title}
          </h3>
          <Badge 
            variant="secondary" 
            className={`${getStatusColor(idea.status)} text-xs shrink-0`}
          >
            {getStatusIcon(idea.status)} {idea.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3">
          {idea.description}
        </p>

        {/* Tags */}
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-300 border-blue-500/30"
              >
                {tag}
              </Badge>
            ))}
            {idea.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs px-2 py-0.5 bg-gray-500/10 text-gray-400 border-gray-500/30"
              >
                +{idea.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="text-xs text-muted-foreground">
          <p>Created {formatDate(idea.$createdAt)}</p>
          {isOwnIdea && (
            <p className="text-blue-400">Your idea</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t border-dark-primary/20">
        <div className="flex items-center justify-between w-full gap-2">
          {/* Vote Button */}
          <Button
            variant={hasUserVoted ? "secondary" : "outline"}
            size="sm"
            onClick={handleVote}
            disabled={hasUserVoted || isVoting}
            className={`flex items-center gap-1 ${
              hasUserVoted 
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' 
                : 'hover:bg-blue-500/10 hover:border-blue-500/30'
            }`}
          >
            {isVoting ? (
              <div className="spinner w-3 h-3" />
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            )}
            <span className="text-xs">{idea.voteCount || 0}</span>
          </Button>

          {/* Status Change (for team leaders/owners) */}
          {canChangeStatus && (
            <Select 
              value={idea.status} 
              onValueChange={handleStatusChange}
              disabled={isChangingStatus}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="submitted">💡 Submitted</SelectItem>
                <SelectItem value="approved">✅ Approved</SelectItem>
                <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                <SelectItem value="completed">🎉 Completed</SelectItem>
                <SelectItem value="rejected">❌ Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default IdeaCard;