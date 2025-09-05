import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import pollService from '../services/pollService';
import PollCreator from './PollCreator';
import PollDisplay from './PollDisplay';
import QuickPoll from './QuickPoll';
import PollHistory from './PollHistory';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  PlusIcon, 
  VoteIcon, 
  ClockIcon, 
  BarChart3Icon,
  ZapIcon,
  HistoryIcon
} from 'lucide-react';

const PollManager = ({ teamId, className }) => {
  const { user } = useAuth();
  const [activePolls, setActivePolls] = useState([]);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  // Load active polls
  useEffect(() => {
    const loadActivePolls = async () => {
      if (!teamId) return;

      setIsLoading(true);
      try {
        const polls = await pollService.getTeamPolls(teamId, { 
          includeExpired: false, 
          limit: 10 
        });
        setActivePolls(polls);
      } catch (error) {
        console.error('Error loading active polls:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivePolls();
  }, [teamId]);

  // Handle poll creation
  const handlePollCreated = (newPoll) => {
    setActivePolls(prev => [newPoll, ...prev]);
    setIsCreatorOpen(false);
  };

  // Handle vote updates
  const handleVoteUpdate = (pollId, vote) => {
    // Could update local state or trigger refresh
    console.log('Vote updated for poll:', pollId, vote);
  };

  // Create quick poll
  const createQuickPoll = async (question) => {
    if (!user?.$id || !teamId) return;

    try {
      const quickPoll = await pollService.createQuickPoll(
        teamId, 
        user.$id, 
        question, 
        1 // 1 hour expiration
      );
      setActivePolls(prev => [quickPoll, ...prev]);
    } catch (error) {
      console.error('Error creating quick poll:', error);
    }
  };

  // Render active polls
  const renderActivePolls = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="bg-background-sidebar border-dark-primary/30">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                  <div className="space-y-2">
                    <div className="h-8 bg-muted rounded"></div>
                    <div className="h-8 bg-muted rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (activePolls.length === 0) {
      return (
        <Card className="bg-background-sidebar border-dark-primary/30">
          <CardContent className="p-8 text-center">
            <VoteIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Active Polls</h3>
            <p className="text-muted-foreground mb-6">
              Create your first poll to gather team input on important decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setIsCreatorOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
              <Button
                onClick={() => createQuickPoll('Should we proceed with this approach?')}
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <ZapIcon className="w-4 h-4 mr-2" />
                Quick Yes/No Poll
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {activePolls.map(poll => {
          // Determine if this is a quick poll (yes/no only)
          const isQuickPoll = poll.options.length === 2 && 
            poll.options.includes('Yes') && 
            poll.options.includes('No');

          if (isQuickPoll) {
            return (
              <QuickPoll
                key={poll.$id}
                poll={poll}
                onVoteUpdate={handleVoteUpdate}
              />
            );
          }

          return (
            <PollDisplay
              key={poll.$id}
              poll={poll}
              onVoteUpdate={handleVoteUpdate}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList className="grid w-auto grid-cols-2 bg-background-sidebar border border-dark-primary/30">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <VoteIcon className="w-4 h-4 mr-2" />
              Active Polls
              {activePolls.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {activePolls.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <HistoryIcon className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {activeTab === 'active' && (
            <div className="flex gap-2">
              <Button
                onClick={() => createQuickPoll('Quick decision needed - yes or no?')}
                variant="outline"
                size="sm"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
              >
                <ZapIcon className="w-4 h-4 mr-2" />
                Quick Poll
              </Button>
              <Button
                onClick={() => setIsCreatorOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </div>
          )}
        </div>

        <TabsContent value="active" className="mt-0">
          {renderActivePolls()}
        </TabsContent>

        <TabsContent value="history" className="mt-0">
          <PollHistory teamId={teamId} />
        </TabsContent>
      </Tabs>

      {/* Poll Creator Modal */}
      <PollCreator
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        onPollCreated={handlePollCreated}
        teamId={teamId}
      />
    </div>
  );
};

export default PollManager;