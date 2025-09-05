import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import pollService from '../services/pollService';
import PollResults from './PollResults';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UsersIcon,
  VoteIcon,
  RefreshCwIcon
} from 'lucide-react';

const PollDisplay = ({ 
  poll, 
  onVoteUpdate, 
  onTaskCreated,
  showResults = false, 
  showExport = true,
  showTaskConversion = true,
  compact = false 
}) => {
  const { user } = useAuth();
  const [isVoting, setIsVoting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [pollResults, setPollResults] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Check if poll is expired
  useEffect(() => {
    const checkExpiration = () => {
      const expired = new Date(poll.expiresAt) < new Date() || !poll.isActive;
      setIsExpired(expired);
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [poll.expiresAt, poll.isActive]);

  // Load user's existing vote and poll results
  useEffect(() => {
    const loadPollData = async () => {
      if (!user?.$id) return;

      try {
        // Get user's existing vote
        const existingVote = await pollService.getUserVote(poll.$id, user.$id);
        setUserVote(existingVote);
        if (existingVote) {
          setSelectedOptions(existingVote.selectedOptions);
        }

        // Get poll results if showing results or poll is expired
        if (showResults || isExpired) {
          const results = await pollService.getPollResults(poll.$id);
          setPollResults(results);
        }
      } catch (error) {
        console.error('Error loading poll data:', error);
      }
    };

    loadPollData();
  }, [poll.$id, user?.$id, showResults, isExpired]);

  // Handle voting
  const handleVote = async () => {
    if (!user?.$id || selectedOptions.length === 0 || isVoting) return;

    setIsVoting(true);

    try {
      // Get hackathon context for chat integration
      const hackathonId = poll.hackathonId || null;
      const voterName = user.name || 'Team Member';
      
      const vote = await pollService.voteOnPoll(
        poll.$id, 
        user.$id, 
        selectedOptions,
        hackathonId,
        voterName
      );
      setUserVote(vote);

      // Notify parent component
      if (onVoteUpdate) {
        onVoteUpdate(poll.$id, vote);
      }

      // Always refresh results after voting to show updated counts
      await refreshResults();
    } catch (error) {
      console.error('Error voting on poll:', error);
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
    } catch (error) {
      console.error('Error refreshing poll results:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle option selection
  const handleOptionSelect = (option) => {
    if (isExpired || userVote) return;

    if (poll.allowMultiple) {
      setSelectedOptions(prev => 
        prev.includes(option) 
          ? prev.filter(opt => opt !== option)
          : [...prev, option]
      );
    } else {
      setSelectedOptions([option]);
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

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  // Render voting interface
  const renderVotingInterface = () => {
    if (isExpired || showResults) return null;

    return (
      <div className="space-y-4">
        {poll.allowMultiple ? (
          <div className="space-y-3">
            {poll.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 min-h-[44px] touch-manipulation">
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={() => handleOptionSelect(option)}
                  disabled={!!userVote}
                  className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500 h-5 w-5"
                />
                <Label 
                  htmlFor={`option-${index}`}
                  className={`flex-1 text-base cursor-pointer py-2 ${
                    userVote ? 'text-muted-foreground' : 'text-foreground hover:text-purple-300'
                  }`}
                >
                  {option}
                </Label>
                {userVote && userVote.selectedOptions.includes(option) && (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <RadioGroup
            value={selectedOptions[0] || ''}
            onValueChange={(value) => handleOptionSelect(value)}
            disabled={!!userVote}
            className="space-y-3"
          >
            {poll.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 min-h-[44px] touch-manipulation">
                <RadioGroupItem 
                  value={option} 
                  id={`option-${index}`}
                  className="data-[state=checked]:border-purple-500 data-[state=checked]:text-purple-500 h-5 w-5"
                />
                <Label 
                  htmlFor={`option-${index}`}
                  className={`flex-1 text-base cursor-pointer py-2 ${
                    userVote ? 'text-muted-foreground' : 'text-foreground hover:text-purple-300'
                  }`}
                >
                  {option}
                </Label>
                {userVote && userVote.selectedOptions.includes(option) && (
                  <CheckCircleIcon className="w-5 h-5 text-green-400" />
                )}
              </div>
            ))}
          </RadioGroup>
        )}

        <div className="flex gap-2">
          {!userVote && (
            <Button
              onClick={handleVote}
              disabled={selectedOptions.length === 0 || isVoting}
              className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white min-h-[48px] touch-manipulation active:scale-95 transition-transform"
            >
              {isVoting ? (
                <>
                  <div className="spinner w-4 h-4 mr-2" />
                  Submitting Vote...
                </>
              ) : (
                <>
                  <VoteIcon className="w-4 h-4 mr-2" />
                  Submit Vote
                </>
              )}
            </Button>
          )}
          
          {(userVote || showResults || isExpired) && pollResults && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshResults}
              disabled={isRefreshing}
              className="px-4 min-h-[48px] min-w-[48px] touch-manipulation"
            >
              <RefreshCwIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Render poll results using the dedicated PollResults component
  const renderResults = () => {
    if (!pollResults || (!showResults && !isExpired && !userVote)) return null;

    return (
      <PollResults
        poll={poll}
        pollResults={pollResults}
        onTaskCreated={onTaskCreated}
        showExport={showExport}
        showTaskConversion={showTaskConversion}
        compact={compact}
      />
    );
  };

  if (compact) {
    return (
      <Card className="bg-background-sidebar border-dark-primary/30">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-foreground line-clamp-2">
                {poll.question}
              </h3>
              <Badge 
                variant={isExpired ? "destructive" : "secondary"}
                className={`ml-2 ${
                  isExpired 
                    ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}
              >
                {isExpired ? 'Expired' : 'Active'}
              </Badge>
            </div>
            
            {!isExpired && (
              <div className="flex items-center text-xs text-muted-foreground">
                <ClockIcon className="w-3 h-3 mr-1" />
                {getTimeRemaining()}
              </div>
            )}

            {renderResults()}
            {renderVotingInterface()}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background-sidebar border-dark-primary/30">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg font-semibold text-white flex items-start">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
              <VoteIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              {poll.question}
            </div>
          </CardTitle>
          <Badge 
            variant={isExpired ? "destructive" : "secondary"}
            className={`ml-2 ${
              isExpired 
                ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
            }`}
          >
            {isExpired ? (
              <>
                <XCircleIcon className="w-3 h-3 mr-1" />
                Expired
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Active
              </>
            )}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-1" />
            {getTimeRemaining()}
          </div>
          <div className="flex items-center space-x-4">
            <span>
              {poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}
            </span>
            {pollResults && (
              <span className="flex items-center">
                <UsersIcon className="w-4 h-4 mr-1" />
                {pollResults.uniqueVoters} {pollResults.uniqueVoters === 1 ? 'vote' : 'votes'}
              </span>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderVotingInterface()}
        {renderResults()}

        {userVote && !isExpired && (
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center text-sm text-green-300">
              <CheckCircleIcon className="w-4 h-4 mr-2" />
              You voted for: {userVote.selectedOptions.join(', ')}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PollDisplay;