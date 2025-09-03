import { useState, useEffect, useCallback } from 'react';

import { teamService } from '../services/teamService';

export const useHackathonTeam = (hackathonId) => {
  // TODO: Authentication removed
  // // TODO: Authentication removed
  // const { user, ... } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserTeamForHackathon = useCallback(async () => {
    if (!user?.$id || !hackathonId) {
      setTeam(null);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const userTeam = await teamService.getUserTeamForHackathon(user.$id, hackathonId);
      setTeam(userTeam);
    } catch (teamError) {
      setError(teamError.message);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [user?.$id, hackathonId]);

  useEffect(() => {
    if (user && hackathonId) {
      checkUserTeamForHackathon();
    } else {
      setTeam(null);
      setLoading(false);
    }
  }, [user, hackathonId, checkUserTeamForHackathon]);

  const createTeam = async (name) => {
    try {
      setError(null);
      setLoading(true);
      const result = await teamService.createTeam(name, user.$id, hackathonId, user.name);
      setTeam({ ...result.team, userRole: 'owner' });
      return result;
    } catch (createError) {
      setError(createError.message);
      throw createError;
    } finally {
      setLoading(false);
    }
  };

  const joinTeam = async (joinCode) => {
    try {
      setError(null);
      setLoading(true);
      const joinedTeam = await teamService.joinTeam(joinCode, user.$id, user.name);
      
      // Verify the joined team belongs to this hackathon
      if (joinedTeam.hackathonId === hackathonId) {
        setTeam({ ...joinedTeam, userRole: 'member' });
        return joinedTeam;
      } else {
        throw new Error('This team belongs to a different hackathon');
      }
    } catch (joinError) {
      setError(joinError.message);
      throw joinError;
    } finally {
      setLoading(false);
    }
  };

  const refreshTeam = async () => {
    if (user && hackathonId) {
      await checkUserTeamForHackathon();
    }
  };

  return {
    team,
    loading,
    error,
    createTeam,
    joinTeam,
    refreshTeam,
    hasTeam: !!team
  };
};