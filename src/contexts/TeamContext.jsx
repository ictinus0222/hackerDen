import { createContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { teamService } from '../services/teamService';

const TeamContext = createContext();

const TeamProvider = ({ children }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkUserTeam = useCallback(async () => {
    if (!user?.$id) return;
    
    try {
      setLoading(true);
      setError(null);
      const userTeam = await teamService.getUserTeam(user.$id);
      setTeam(userTeam);
    } catch (teamError) {
      setError(teamError.message);
      setTeam(null);
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    if (user) {
      checkUserTeam();
    } else {
      setTeam(null);
      setLoading(false);
    }
  }, [user, checkUserTeam]);

  const createTeam = async (name) => {
    try {
      setError(null);
      setLoading(true);
      const result = await teamService.createTeam(name, user.$id, user.name);
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
      setTeam({ ...joinedTeam, userRole: 'member' });
      return joinedTeam;
    } catch (joinError) {
      setError(joinError.message);
      throw joinError;
    } finally {
      setLoading(false);
    }
  };

  const refreshTeam = async () => {
    if (user) {
      await checkUserTeam();
    }
  };

  const value = {
    team,
    loading,
    error,
    createTeam,
    joinTeam,
    refreshTeam,
    hasTeam: !!team
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
};

export { TeamContext, TeamProvider };