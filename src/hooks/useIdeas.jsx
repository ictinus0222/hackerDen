import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from './useAuth';
import { ideaService } from '../services/ideaService';
import { teamService } from '../services/teamService';

export const useIdeas = () => {
  const { hackathonId } = useParams();
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [userVoteStatus, setUserVoteStatus] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Helper functions
  const createIdea = async (ideaData) => {
    if (!team?.$id || !hackathonId) {
      throw new Error('Team or hackathon information is missing');
    }

    const newIdea = await ideaService.createIdea(team.$id, hackathonId, ideaData, user.name);
    // Real-time subscription will handle updating the state
    return newIdea;
  };

  const voteOnIdea = async (ideaId) => {
    if (userVoteStatus[ideaId]) {
      throw new Error('You have already voted on this idea');
    }

    await ideaService.voteOnIdea(ideaId, user.$id, user.name);
    // Real-time subscription will handle updating the state
  };

  const updateIdeaStatus = async (ideaId, status) => {
    await ideaService.updateIdeaStatus(ideaId, status, user.name);
    // Real-time subscription will handle updating the state
  };

  const convertIdeaToTask = async (ideaId) => {
    return await ideaService.convertIdeaToTask(ideaId);
  };

  return {
    team,
    ideas,
    userVoteStatus,
    isLoading,
    error,
    createIdea,
    voteOnIdea,
    updateIdeaStatus,
    convertIdeaToTask,
    // Helper computed values
    canChangeStatus: team?.userRole === 'owner' || team?.userRole === 'leader'
  };
};