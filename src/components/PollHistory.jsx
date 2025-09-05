import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import pollService from '../services/pollService';
import { taskService } from '../services/taskService';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  ChevronDownIcon, 
  ChevronRightIcon,
  ClockIcon, 
  UsersIcon,
  BarChart3Icon,
  VoteIcon,
  TrophyIcon,
  CalendarIcon,
  PlusIcon,
  DownloadIcon,
  MessageSquareIcon
} from 'lucide-react';

const PollHistory = ({ teamId, hackathonId, onTaskCreated, className }) => {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [pollResults, setPollResults] = useState({});
  const [userVotes, setUserVotes] = useState({});
  const [expandedPolls, setExpandedPolls] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [creatingTasks, setCreatingTasks] = useState(new Set());
  const [exportingPolls, setExportingPolls] = useState(new Set());

  // Load poll history
  useEffect(() => {
    const loadPollHistory = async () => {
      if (!teamId || !user?.$id) return;

      setIsLoading(true);
      try {
        // Get all polls including expired ones
        const teamPolls = await pollService.getTeamPolls(teamId, { 
          includeExpired: true, 
          limit: 50 
        });
        
        setPolls(teamPolls);

        // Load results for all polls
        const resultsPromises = teamPolls.map(poll => 
          pollService.getPollResults(poll.$id)
        );
        const results = await Promise.all(resultsPromises);
        
        const resultsMap = {};
        results.forEach((result, index) => {
          resultsMap[teamPolls[index].$id] = result;
        });
        setPollResults(resultsMap);

        // Load user votes for all polls
        const pollIds = teamPolls.map(poll => poll.$id);
        const votes = await pollService.getVoteDetails(pollIds, user.$id);
        setUserVotes(votes);

      } catch (error) {
        console.error('Error loading poll history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPollHistory();
  }, [teamId, user?.$id]);

  // Toggle poll expansion
  const togglePollExpansion = (pollId) => {
    setExpandedPolls(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pollId)) {
        newSet.delete(pollId);
      } else {
        newSet.add(pollId);
      }
      return newSet;
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  // Check if poll is expired
  const isPollExpired = (poll) => {
    return new Date(poll.expiresAt) < new Date() || !poll.isActive;
  };

  // Handle converting poll to task
  const handleConvertToTask = async (pollId, winningOption) => {
    if (!user?.$id || creatingTasks.has(pollId)) return;

    setCreatingTasks(prev => new Set([...prev, pollId]));

    try {
      const creatorName = user.name || 'Team Member';
      
      const newTask = await pollService.convertPollToTask(
        pollId,
        winningOption,
        hackathonId,
        user.$id,
        creatorName
      );

      // Notify parent component
      if (onTaskCreated) {
        onTaskCreated(newTask, winningOption);
      }
    } catch (error) {
      console.error('Error converting poll to task:', error);
    } finally {
      setCreatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }
  };

  // Handle exporting poll results
  const handleExportResults = async (pollId, format = 'csv') => {
    if (exportingPolls.has(pollId)) return;

    setExportingPolls(prev => new Set([...prev, pollId]));

    try {
      const exportData = await pollService.exportPollResults(pollId, format);
      
      // Create and download file
      const blob = new Blob([exportData.content], { type: `${exportData.mimeType};charset=utf-8;` });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', exportData.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting poll results:', error);
    } finally {
      setExportingPolls(prev => {
        const newSet = new Set(prev);
        newSet.delete(pollId);
        return newSet;
      });
    }
  };

  // Render poll summary
  const renderPollSummary = (poll) => {
    const results = pollResults[poll.$id];
    const userVote = userVotes[poll.$id];
    const isExpired = isPollExpired(poll);
    const isExpanded = expandedPolls.has(poll.$id);

    return (
      <Card key={poll.$id} className="bg-background-sidebar border-dark-primary/30">
        <Collapsible>
          <CollapsibleTrigger asChild>
            <CardHeader 
              className="pb-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => togglePollExpansion(poll.$id)}
            >
              <div className="flex items-start justify-between">
                <CardTitle className="text-sm font-medium text-white flex items-start">
                  <div className="flex items-center mr-3 mt-0.5">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center ml-2">
                      <VoteIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <span className="flex-1 leading-tight line-clamp-2">{poll.question}</span>
                </CardTitle>
                <div className="flex items-center space-x-2 ml-2">
                  {userVote && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      Voted
                    </Badge>
                  )}
                  <Badge 
                    variant={isExpired ? "destructive" : "secondary"}
                    className={`text-xs ${
                      isExpired 
                        ? 'bg-red-500/20 text-red-300 border-red-500/30' 
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}
                  >
                    {isExpired ? 'Expired' : 'Active'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <CalendarIcon className="w-3 h-3 mr-1" />
                    {formatDate(poll.createdAt)}
                  </span>
                  {results && (
                    <span className="flex items-center">
                      <UsersIcon className="w-3 h-3 mr-1" />
                      {results.uniqueVoters} {results.uniqueVoters === 1 ? 'vote' : 'votes'}
                    </span>
                  )}
                </div>
                <span>
                  {poll.allowMultiple ? 'Multiple Choice' : 'Single Choice'}
                </span>
              </div>
            </CardHeader>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <CardContent className="pt-0">
              {results && (
                <div className="space-y-4">
                  {/* Results */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-foreground flex items-center">
                        <BarChart3Icon className="w-4 h-4 mr-2 text-purple-400" />
                        Results
                      </h4>
                      {results.winners.length > 0 && (
                        <div className="flex items-center text-xs text-yellow-400">
                          <TrophyIcon className="w-3 h-3 mr-1" />
                          Winner{results.winners.length > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      {results.results.map((result, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className={`flex-1 flex items-center ${
                              results.winners.includes(result.option) 
                                ? 'text-yellow-400 font-medium' 
                                : 'text-foreground'
                            }`}>
                              {result.option}
                              {results.winners.includes(result.option) && (
                                <TrophyIcon className="w-3 h-3 ml-2 text-yellow-400" />
                              )}
                              {userVote && userVote.includes(result.option) && (
                                <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                  Your vote
                                </Badge>
                              )}
                            </span>
                            <span className="text-muted-foreground text-xs">
                              {result.votes} ({result.percentage}%)
                            </span>
                          </div>
                          <Progress 
                            value={result.percentage} 
                            className="h-1.5"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Poll Actions */}
                  {results && results.winners.length > 0 && (
                    <div className="pt-3 border-t border-dark-primary/20">
                      <div className="flex flex-wrap gap-2">
                        {/* Export Results */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExportResults(poll.$id)}
                          disabled={exportingPolls.has(poll.$id)}
                          className="text-xs"
                        >
                          {exportingPolls.has(poll.$id) ? (
                            <>
                              <div className="spinner w-3 h-3 mr-1" />
                              Exporting...
                            </>
                          ) : (
                            <>
                              <DownloadIcon className="w-3 h-3 mr-1" />
                              Export
                            </>
                          )}
                        </Button>

                        {/* Convert to Task */}
                        {results.winners.length === 1 && hackathonId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleConvertToTask(poll.$id, results.winners[0])}
                            disabled={creatingTasks.has(poll.$id)}
                            className="text-xs"
                          >
                            {creatingTasks.has(poll.$id) ? (
                              <>
                                <div className="spinner w-3 h-3 mr-1" />
                                Creating...
                              </>
                            ) : (
                              <>
                                <PlusIcon className="w-3 h-3 mr-1" />
                                Create Task
                              </>
                            )}
                          </Button>
                        )}

                        {/* Multiple winners - show dropdown */}
                        {results.winners.length > 1 && hackathonId && (
                          <div className="flex flex-wrap gap-1">
                            {results.winners.map((winner, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleConvertToTask(poll.$id, winner)}
                                disabled={creatingTasks.has(poll.$id)}
                                className="text-xs"
                              >
                                <PlusIcon className="w-3 h-3 mr-1" />
                                {winner}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Poll Details */}
                  <div className="pt-3 border-t border-dark-primary/20">
                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                      <div>
                        <span className="font-medium">Created:</span>
                        <br />
                        {new Date(poll.createdAt).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Expired:</span>
                        <br />
                        {new Date(poll.expiresAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <Card className={`bg-background-sidebar border-dark-primary/30 ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="spinner w-6 h-6 mr-3" />
            <span className="text-muted-foreground">Loading poll history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (polls.length === 0) {
    return (
      <Card className={`bg-background-sidebar border-dark-primary/30 ${className}`}>
        <CardContent className="p-6 text-center">
          <VoteIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-2">No Polls Yet</h3>
          <p className="text-muted-foreground text-sm">
            Your team hasn't created any polls yet. Create your first poll to get team input on decisions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-background-sidebar border-dark-primary/30 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-white flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-purple-400" />
          Poll History
          <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
            {polls.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-3">
            {polls.map(renderPollSummary)}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PollHistory;