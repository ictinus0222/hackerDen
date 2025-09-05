import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import pollService from '../services/pollService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ThumbsUpIcon, 
  ThumbsDownIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  VoteIcon,
  RefreshCwIcon,
  TrophyIcon,
  UsersIcon
} from 'lucide-react';

const QuickPoll = ({ poll, onVoteUpdate, onTaskCreated, className }) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [voteResults, setVoteResults] = useState({ yes: 0, no: 0, total: 0 });
  const [pollResults, setPollResults] = useState(null);

  // Load poll data on mount
  useEffect(() => {
    const loadPollData = async () => {
      if (!user?.$id) return;

      try {
        // Get user's existing vote
        const existingVote = await pollService.getUserVote(poll.$id, user.$id);
        setUserVote(existingVote);

        // Get poll results
        const results = await pollService.getPollResults(poll.$id);
        const yesResult = results.results.find(r => r.option === 'Yes') || { votes: 0 };
        const noResult = results.results.find(r => r.option === 'No') || { votes: 0 };
        
        setVoteResults({
          yes: yesResult.votes,
          no: noResult.votes,
          total: results.uniqueVoters
        });
      } catch (error) {
        console.error('Error loading quick poll data:', error);
      }
    };

    loadPollData();
  }, [poll.$id, user?.$id]);

  // Check if poll is expired
  const isExpired = new Date(poll.expiresAt) < new Date() || !poll.isActive;

  // Handle voting
  const handleVote = async (option) => {
    if (!user?.$id || isVoting || userVote || isExpired) return;

    setIsVoting(true);

    try {
      const vote = await pollService.voteOnPoll(poll.$id, user.$id, option);
      setUserVote(vote);

      // Refresh results after voting
      await refreshResults();

      // Notify parent component
      if (onVoteUpdate) {
        onVoteUpdate(poll.$id, vote);
      }
    } catch (error) {
      console.error('Error voting on quick poll:', error);
      // Could add toast notification here
    } finally {
      setIsVoting(false);
    }
  };

  // Refresh poll results
  const refreshResults = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      const results = await pollService.getPollResults(poll.$id);
      setPollResults(results);
      
      // Update local results for display
      const yesResult = results.results.find(r => r.option === 'Yes') || { votes: 0 };
      const noResult = results.results.find(r => r.option === 'No') || { votes: 0 };
      
      setVoteResults({
        yes: yesResult.votes,
        no: noResult.votes,
        total: yesResult.votes + noResult.votes
      });
    } catch (error) {
      console.error('Error refreshing quick poll results:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle converting winning option to task
  const handleConvertToTask = async (winningOption) => {
    if (!user?.$id || isVoting) return;

    setIsVoting(true);

    try {
      // Get task data from poll service
      const taskData = await pollService.convertPollToTask(poll.$id, winningOption);
      
      // Import taskService dynamically to avoid circular dependencies
      const { taskService } = await import('../services/taskService');
      
      // Create the task using taskService
      const newTask = await taskService.createTask(
        poll.teamId,
        null, // hackathonId - will be handled by taskService
        {
          title: taskData.title,
          description: taskData.description,
          assignedTo: null, // Unassigned initially
          createdBy: user.$id,
          priority: taskData.priority || 'medium'
        },
        user.name || 'Unknown User',
        null
      );

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(newTask, winningOption);
      }
    } catch (error) {
      console.error('Error converting quick poll to task:', error);
    } finally {
      setIsVoting(false);
    }
  };

  // Format time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(poll.expiresAt);
    const diff = expiry - now;

    if (diff <= 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else {
      return `${minutes}m left`;
    }
  };

  // Calculate percentages
  const yesPercentage = voteResults.total > 0 ? Math.round((voteResults.yes / voteResults.total) * 100) : 0;
  const noPercentage = voteResults.total > 0 ? Math.round((voteResults.no / voteResults.total) * 100) : 0;

  return (
    <Card className={`bg-background-sidebar border-dark-primary/30 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base font-semibold text-white flex items-start">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
              <VoteIcon className="w-3 h-3 text-white" />
            </div>
            <span className="flex-1 leading-tight">{poll.question}</span>
          </CardTitle>
          <Badge 
            variant={isExpired ? "destructive" : "secondary"}
            className={`ml-2 text-xs ${
              isExpired 
                ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
            }`}
          >
            {isExpired ? (
              <>
                <XCircleIcon className="w-2 h-2 mr-1" />
                Expired
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-2 h-2 mr-1" />
                Active
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center text-xs text-muted-foreground">
          <ClockIcon className="w-3 h-3 mr-1" />
          {getTimeRemaining()}
          {voteResults.total > 0 && (
            <>
              <span className="mx-2">•</span>
              <span>{voteResults.total} {voteResults.total === 1 ? 'vote' : 'votes'}</span>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Buttons */}
        {!isExpired && !userVote && (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleVote('Yes')}
              disabled={isVoting}
              variant="outline"
              className="h-12 bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20 hover:border-green-500/50 transition-all duration-200"
            >
              <ThumbsUpIcon className="w-4 h-4 mr-2" />
              Yes
            </Button>
            <Button
              onClick={() => handleVote('No')}
              disabled={isVoting}
              variant="outline"
              className="h-12 bg-red-500/10 border-red-500/30 text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
            >
              <ThumbsDownIcon className="w-4 h-4 mr-2" />
              No
            </Button>
          </div>
        )}

        {/* Results Display */}
        {(userVote || isExpired || voteResults.total > 0) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-muted-foreground flex items-center">
                <UsersIcon className="w-3 h-3 mr-1" />
                Results
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshResults}
                disabled={isRefreshing}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              >
                <RefreshCwIcon className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <div className="space-y-3">
              {/* Yes Results */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ThumbsUpIcon className="w-3 h-3 mr-2 text-green-400" />
                    <span className="text-sm text-foreground">Yes</span>
                    {userVote && userVote.selectedOptions.includes('Yes') && (
                      <CheckCircleIcon className="w-3 h-3 ml-2 text-green-400" />
                    )}
                    {pollResults && pollResults.winners.includes('Yes') && (
                      <TrophyIcon className="w-3 h-3 ml-1 text-yellow-400" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {voteResults.yes} ({yesPercentage}%)
                  </span>
                </div>
                <Progress 
                  value={yesPercentage} 
                  className="h-2"
                  style={{
                    '--progress-background': pollResults && pollResults.winners.includes('Yes') 
                      ? 'rgb(34 197 94)' 
                      : 'rgb(34 197 94)'
                  }}
                />
              </div>

              {/* No Results */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ThumbsDownIcon className="w-3 h-3 mr-2 text-red-400" />
                    <span className="text-sm text-foreground">No</span>
                    {userVote && userVote.selectedOptions.includes('No') && (
                      <CheckCircleIcon className="w-3 h-3 ml-2 text-green-400" />
                    )}
                    {pollResults && pollResults.winners.includes('No') && (
                      <TrophyIcon className="w-3 h-3 ml-1 text-yellow-400" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {voteResults.no} ({noPercentage}%)
                  </span>
                </div>
                <Progress 
                  value={noPercentage} 
                  className="h-2"
                  style={{
                    '--progress-background': pollResults && pollResults.winners.includes('No') 
                      ? 'rgb(34 197 94)' 
                      : 'rgb(239 68 68)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Task Conversion for Winner */}
        {isExpired && pollResults && pollResults.winners.length === 1 && onTaskCreated && (
          <Button
            onClick={() => handleConvertToTask(pollResults.winners[0])}
            disabled={isVoting}
            variant="outline"
            size="sm"
            className="w-full text-xs bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
          >
            <CheckCircleIcon className="w-3 h-3 mr-2" />
            Create Task: "{pollResults.winners[0]}"
          </Button>
        )}

        {/* User Vote Confirmation */}
        {userVote && !isExpired && (
          <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-center text-xs text-blue-300">
              <CheckCircleIcon className="w-3 h-3 mr-2" />
              You voted: {userVote.selectedOptions[0]}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isVoting && (
          <div className="flex items-center justify-center py-2">
            <div className="spinner w-4 h-4 mr-2" />
            <span className="text-xs text-muted-foreground">Submitting vote...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickPoll;