import { useState, useEffect, useCallback } from 'react';
import { reactionService } from '../services/reactionService';
import { useAuth } from './useAuth';

export const useReactions = (targetId, targetType) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load reactions
  const loadReactions = useCallback(async () => {
    if (!targetId || !targetType) {
      setReactions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const reactionGroups = await reactionService.getReactions(targetId, targetType);
      setReactions(reactionGroups);
    } catch (err) {
      console.error('Failed to load reactions:', err);
      setError(err.message);
      setReactions([]);
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  // Add or remove reaction
  const toggleReaction = useCallback(async (emoji, isCustom = false) => {
    if (!user?.$id) {
      throw new Error('User must be logged in to react');
    }

    try {
      const reaction = await reactionService.addReaction(
        targetId,
        targetType,
        user.$id,
        emoji,
        isCustom
      );

      // Reload reactions to get updated counts
      await loadReactions();
      
      return reaction;
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
      setError(err.message);
      throw err;
    }
  }, [targetId, targetType, user?.$id, loadReactions]);

  // Get user's reactions for this target
  const getUserReactions = useCallback(() => {
    if (!user?.$id) return [];
    
    return reactions.reduce((userReactions, group) => {
      if (group.users.includes(user.$id)) {
        userReactions.push({
          emoji: group.emoji,
          isCustom: group.isCustom
        });
      }
      return userReactions;
    }, []);
  }, [reactions, user?.$id]);

  // Check if user has reacted with specific emoji
  const hasUserReacted = useCallback((emoji) => {
    if (!user?.$id) return false;
    
    const reactionGroup = reactions.find(group => group.emoji === emoji);
    return reactionGroup ? reactionGroup.users.includes(user.$id) : false;
  }, [reactions, user?.$id]);

  // Get reaction summary
  const getReactionSummary = useCallback(() => {
    return reactionService.getReactionSummary(reactions);
  }, [reactions]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!targetId || !targetType) return;

    const unsubscribe = reactionService.subscribeToReactions(
      targetId,
      targetType,
      () => {
        // Reload reactions when there are changes
        loadReactions();
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [targetId, targetType, loadReactions]);

  // Load reactions on mount and when dependencies change
  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  return {
    reactions,
    loading,
    error,
    toggleReaction,
    getUserReactions,
    hasUserReacted,
    getReactionSummary,
    refetch: loadReactions
  };
};

export const useCustomEmoji = (teamId) => {
  const [customEmoji, setCustomEmoji] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load custom emoji
  const loadCustomEmoji = useCallback(async () => {
    if (!teamId) {
      setCustomEmoji([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const emoji = await reactionService.getTeamCustomEmoji(teamId);
      setCustomEmoji(emoji);
    } catch (err) {
      console.error('Failed to load custom emoji:', err);
      setError(err.message);
      setCustomEmoji([]);
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  // Upload custom emoji
  const uploadEmoji = useCallback(async (file, name) => {
    if (!teamId) {
      throw new Error('Team ID is required to upload custom emoji');
    }

    try {
      setError(null);
      const emojiData = await reactionService.uploadCustomEmoji(teamId, file, name);
      
      // Reload emoji list
      await loadCustomEmoji();
      
      return emojiData;
    } catch (err) {
      console.error('Failed to upload custom emoji:', err);
      setError(err.message);
      throw err;
    }
  }, [teamId, loadCustomEmoji]);

  // Delete custom emoji
  const deleteEmoji = useCallback(async (emojiId) => {
    try {
      setError(null);
      await reactionService.deleteCustomEmoji(emojiId);
      
      // Reload emoji list
      await loadCustomEmoji();
    } catch (err) {
      console.error('Failed to delete custom emoji:', err);
      setError(err.message);
      throw err;
    }
  }, [loadCustomEmoji]);

  // Load custom emoji on mount and when teamId changes
  useEffect(() => {
    loadCustomEmoji();
  }, [loadCustomEmoji]);

  return {
    customEmoji,
    loading,
    error,
    uploadEmoji,
    deleteEmoji,
    refetch: loadCustomEmoji
  };
};