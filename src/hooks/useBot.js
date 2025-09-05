import { useEffect, useCallback, useRef } from 'react';
import botService from '../services/botService';

/**
 * Custom hook for bot integration with chat system
 * Handles bot message processing, easter eggs, and contextual messaging
 */
export const useBot = (teamId, hackathonId, enabled = true) => {
  const lastActivityCheck = useRef(Date.now());
  const botCheckInterval = useRef(null);

  /**
   * Process user message for easter egg commands
   */
  const processMessage = useCallback(async (messageContent, userName) => {
    if (!enabled || !teamId || !hackathonId) return null;

    try {
      return await botService.processMessageForEasterEggs(
        messageContent,
        teamId,
        hackathonId,
        userName
      );
    } catch (error) {
      console.error('Error processing message for bot:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Send motivational message
   */
  const sendMotivationalMessage = useCallback(async (context = 'general') => {
    if (!enabled || !teamId || !hackathonId) return null;

    try {
      return await botService.sendMotivationalMessage(teamId, hackathonId, context);
    } catch (error) {
      console.error('Error sending motivational message:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Send contextual message based on trigger
   */
  const sendContextualMessage = useCallback(async (trigger) => {
    if (!enabled || !teamId || !hackathonId) return null;

    try {
      return await botService.sendContextualMessage(teamId, hackathonId, trigger);
    } catch (error) {
      console.error('Error sending contextual message:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Get contextual tips
   */
  const getContextualTips = useCallback(async (sendToChat = false) => {
    if (!enabled || !teamId || !hackathonId) return [];

    try {
      const activity = await botService.analyzeTeamActivity(teamId, hackathonId);
      return await botService.getContextualTips(activity, teamId, hackathonId, sendToChat);
    } catch (error) {
      console.error('Error getting contextual tips:', error);
      return [];
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Schedule bot reminders
   */
  const scheduleReminders = useCallback(async (preferences) => {
    if (!enabled || !teamId || !hackathonId) return null;

    try {
      return await botService.scheduleReminders(teamId, hackathonId, preferences);
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Trigger easter egg
   */
  const triggerEasterEgg = useCallback(async (command, userName) => {
    if (!enabled || !teamId || !hackathonId) return null;

    try {
      return await botService.triggerEasterEgg(command, teamId, hackathonId, userName);
    } catch (error) {
      console.error('Error triggering easter egg:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled]);

  /**
   * Check if bot should send a message based on activity
   */
  const checkBotActivity = useCallback(async () => {
    if (!enabled || !teamId || !hackathonId) return;

    try {
      const recommendation = await botService.shouldSendMessage(teamId, hackathonId);
      
      if (recommendation.shouldSend && recommendation.priority === 'high') {
        // Send high priority messages immediately
        await sendContextualMessage(recommendation.reason);
      }
      
      return recommendation;
    } catch (error) {
      console.error('Error checking bot activity:', error);
      return null;
    }
  }, [teamId, hackathonId, enabled, sendContextualMessage]);

  /**
   * Handle task completion event
   */
  const onTaskCompleted = useCallback(async (taskData) => {
    if (!enabled) return;

    try {
      // Send contextual message for task completion
      await sendContextualMessage('task_completed');
    } catch (error) {
      console.error('Error handling task completion:', error);
    }
  }, [enabled, sendContextualMessage]);

  /**
   * Handle long inactivity
   */
  const onLongInactivity = useCallback(async () => {
    if (!enabled) return;

    try {
      await sendContextualMessage('long_inactivity');
    } catch (error) {
      console.error('Error handling long inactivity:', error);
    }
  }, [enabled, sendContextualMessage]);

  /**
   * Handle first message sent
   */
  const onFirstMessage = useCallback(async () => {
    if (!enabled) return;

    try {
      await sendContextualMessage('first_message');
    } catch (error) {
      console.error('Error handling first message:', error);
    }
  }, [enabled, sendContextualMessage]);

  // Set up periodic bot activity checking
  useEffect(() => {
    if (!enabled || !teamId || !hackathonId) return;

    // Check bot activity every 30 minutes
    botCheckInterval.current = setInterval(async () => {
      await checkBotActivity();
    }, 30 * 60 * 1000);

    return () => {
      if (botCheckInterval.current) {
        clearInterval(botCheckInterval.current);
      }
    };
  }, [enabled, teamId, hackathonId, checkBotActivity]);

  // Initial bot activity check
  useEffect(() => {
    if (enabled && teamId && hackathonId) {
      // Delay initial check to avoid overwhelming on page load
      const timeout = setTimeout(() => {
        checkBotActivity();
      }, 5000);

      return () => clearTimeout(timeout);
    }
  }, [enabled, teamId, hackathonId, checkBotActivity]);

  return {
    processMessage,
    sendMotivationalMessage,
    sendContextualMessage,
    getContextualTips,
    scheduleReminders,
    triggerEasterEgg,
    checkBotActivity,
    onTaskCompleted,
    onLongInactivity,
    onFirstMessage,
    enabled
  };
};

export default useBot;