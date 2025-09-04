import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ideaService } from '../services/ideaService';
import { teamService } from '../services/teamService';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { ScrollArea } from './ui/scroll-area';
import IdeaModal from './IdeaModal';
import IdeaCard from './IdeaCard';

const IdeaBoard = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [filteredIdeas, setFilteredIdeas] = useState([]);
  const [userVoteStatus, setUserVoteStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState('date');
  const [filterByStatus, setFilterByStatus] = useState('all');
  const [filterByTag, setFilterByTag] = useState('all');

  // Get unique tags from all ideas
  const allTags = [...new Set(ideas.flatMap(idea => idea.tags || []))];

  // Get user's team for this hackathon
  useEffect(() => {
    const fetchTeam = async () => {
      if (!user?.$id || !hackathonId) {
        setTeam(null);
        return;
      }

      try {
        const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
        setTeam(userTeam);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError('Failed to load team information');
        setTeam(null);
      }
    };

    fetchTeam();
  }, [user?.$id, hackathonId]);

  // Fetch ideas when team is available
  useEffect(() => {
    const fetchIdeas = async () => {
      if (!team?.$id || !hackathonId) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const teamIdeas = await ideaService.getTeamIdeas(team.$id, hackathonId);
        setIdeas(teamIdeas);

        // Get user vote status for all ideas
        if (teamIdeas.length > 0) {
          const ideaIds = teamIdeas.map(idea => idea.$id);
          const voteStatus = await ideaService.getUserVoteStatus(ideaIds, user.$id);
          setUserVoteStatus(voteStatus);
        }
      } catch (err) {
        console.error('Error fetching ideas:', err);
        setError(err.message || 'Failed to load ideas');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();
  }, [team?.$id, hackathonId, user?.$id]);

  // Filter and sort ideas
  useEffect(() => {
    let filtered = [...ideas];

    // Filter by status
    if (filterByStatus !== 'all') {
      filtered = filtered.filter(idea => idea.status === filterByStatus);
    }

    // Filter by tag
    if (filterByTag !== 'all') {
      filtered = filtered.filter(idea => idea.tags && idea.tags.includes(filterByTag));
    }

    // Sort ideas
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'votes':
          return (b.voteCount || 0) - (a.voteCount || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'date':
        default:
          return new Date(b.$createdAt) - new Date(a.$createdAt);
      }
    });

    setFilteredIdeas(filtered);
  }, [ideas, sortBy, filterByStatus, filterByTag]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!team?.$id || !hackathonId) {
      return;
    }

    const unsubscribeIdeas = ideaService.subscribeToIdeas(team.$id, hackathonId, (response) => {
      console.log('Real-time idea update:', response);
      
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        // New idea created
        setIdeas(prev => [response.payload, ...prev]);
      } else if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        // Idea updated
        setIdeas(prev => prev.map(idea => 
          idea.$id === response.payload.$id ? response.payload : idea
        ));
      } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
        // Idea deleted
        setIdeas(prev => prev.filter(idea => idea.$id !== response.payload.$id));
      }
    });

    const unsubscribeVotes = ideaService.subscribeToVotes((response) => {
      console.log('Real-time vote update:', response);
      
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        // New vote created - refresh the idea to get updated vote count
        const vote = response.payload;
        setIdeas(prev => prev.map(idea => {
          if (idea.$id === vote.ideaId) {
            return { ...idea, voteCount: (idea.voteCount || 0) + 1 };
          }
          return idea;
        }));

        // Update user vote status
        if (vote.userId === user.$id) {
          setUserVoteStatus(prev => ({ ...prev, [vote.ideaId]: true }));
        }
      }
    });

    return () => {
      unsubscribeIdeas();
      unsubscribeVotes();
    };
  }, [team?.$id, hackathonId, user.$id]);

  const handleIdeaCreated = (newIdea) => {
    setIdeas(prev => [newIdea, ...prev]);
    setIsIdeaModalOpen(false);
  };

  const handleVote = async (ideaId) => {
    try {
      await ideaService.voteOnIdea(ideaId, user.$id, user.name);
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error voting on idea:', error);
      // You could show a toast notification here
    }
  };

  const handleStatusChange = async (ideaId, newStatus) => {
    try {
      await ideaService.updateIdeaStatus(ideaId, newStatus, user.name);
      // The real-time subscription will handle updating the UI
    } catch (error) {
      console.error('Error updating idea status:', error);
      // You could show a toast notification here
    }
  };

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">You need to be part of a team to view ideas.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner w-8 h-8 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Team Ideas</h2>
          <p className="text-muted-foreground">
            Share and vote on project ideas with your team
          </p>
        </div>
        <Button
          onClick={() => setIsIdeaModalOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Submit Idea
        </Button>
      </div>

      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="votes">Votes</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select value={filterByStatus} onValueChange={setFilterByStatus}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {allTags.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Tag:</span>
            <Select value={filterByTag} onValueChange={setFilterByTag}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Ideas Yet</h3>
          <p className="text-muted-foreground mb-4">
            {ideas.length === 0 
              ? "Be the first to share a brilliant idea with your team!"
              : "No ideas match your current filters."
            }
          </p>
          {ideas.length === 0 && (
            <Button
              onClick={() => setIsIdeaModalOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              Submit First Idea
            </Button>
          )}
        </div>
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.$id}
                idea={idea}
                hasUserVoted={userVoteStatus[idea.$id] || false}
                onVote={() => handleVote(idea.$id)}
                onStatusChange={(newStatus) => handleStatusChange(idea.$id, newStatus)}
                canChangeStatus={team.userRole === 'owner' || team.userRole === 'leader'}
                currentUser={user}
              />
            ))}
          </div>
        </ScrollArea>
      )}

      {/* Idea Modal */}
      <IdeaModal
        isOpen={isIdeaModalOpen}
        onClose={() => setIsIdeaModalOpen(false)}
        onIdeaCreated={handleIdeaCreated}
      />
    </div>
  );
};

export default IdeaBoard;