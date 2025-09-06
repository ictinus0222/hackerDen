import client, { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

const MESSAGES_COLLECTION_ID = COLLECTIONS.MESSAGES;

export const messageService = {
  // Send a user message
  async sendMessage(teamId, hackathonId, userId, content) {
    try {
      const messageData = {
        teamId,
        hackathonId,
        userId,
        content: content.trim(),
        type: 'user',
        $createdAt: new Date().toISOString()
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );


      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  },

  // Send a system message (for task/vault updates)
  async sendSystemMessage(teamId, hackathonId, content, type = 'system', systemData = null) {
    try {
      const messageData = {
        teamId,
        hackathonId,
        userId: 'system', // Use 'system' as a special user ID for system messages
        userName: 'System', // Use 'System' as the display name
        content: content.trim(),
        type,
        systemData: systemData ? JSON.stringify(systemData) : null
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );

      return response;
    } catch (error) {
      console.error('Error sending system message:', error);
      throw new Error('Failed to send system message.');
    }
  },

  // Enhanced message loading with better pagination and caching
  async getMessages(teamId, hackathonId, limit = 50, offset = 0) {
    try {
      // Optimize limit for better performance - don't load too many at once
      const optimizedLimit = Math.min(limit, 100);
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal('teamId', teamId),
          Query.equal('hackathonId', hackathonId),
          Query.orderDesc('$createdAt'),
          Query.limit(optimizedLimit),
          Query.offset(offset)
        ]
      );

      // Parse systemData for system messages with error handling
      const messages = response.documents.map(message => {
        try {
          return {
            ...message,
            systemData: message.systemData ? JSON.parse(message.systemData) : null
          };
        } catch (parseError) {
          console.warn('Failed to parse systemData for message:', message.$id, parseError);
          return {
            ...message,
            systemData: null
          };
        }
      });

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        total: response.total,
        hasMore: offset + messages.length < response.total
      };
    } catch (error) {
      console.error('Error fetching messages:', error);
      
      // Provide more specific error messages
      if (error.code === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.code === 403) {
        throw new Error('Access denied. You may not have permission to view these messages.');
      } else if (error.code === 404) {
        throw new Error('Messages not found. The team may no longer exist.');
      } else {
        throw new Error('Failed to load messages. Please check your connection and try again.');
      }
    }
  },

  // Subscribe to real-time message updates with enhanced filtering
  subscribeToMessages(teamId, hackathonId, callback) {
    try {
      const unsubscribe = client.subscribe(
        `databases.${DATABASE_ID}.collections.${MESSAGES_COLLECTION_ID}.documents`,
        (response) => {
          const { events, payload } = response;
          
          // Only process messages for this team and hackathon
          if (payload.teamId === teamId && payload.hackathonId === hackathonId) {
            // Parse systemData if it exists
            const message = {
              ...payload,
              systemData: payload.systemData ? JSON.parse(payload.systemData) : null
            };

            callback({
              events,
              payload: message
            });
          }
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('Error subscribing to messages:', error);
      throw new Error('Failed to connect to real-time messages.');
    }
  },

  // Typing indicator functionality (placeholder for future implementation)
  sendTypingIndicator(teamId, userId, userName) {
    // This would typically send a real-time event or use a separate collection
    // For now, we'll use a simple in-memory approach or WebSocket events
    try {
      // In a real implementation, this might use Appwrite's real-time channels
      // or a separate typing indicators collection with TTL
      console.log(`${userName} is typing in team ${teamId}`);
      
      // Could implement using Appwrite's real-time channels:
      // client.subscribe(`team.${teamId}.typing`, callback);
    } catch (error) {
      console.warn('Failed to send typing indicator:', error);
    }
  },

  stopTypingIndicator(teamId, userId) {
    try {
      console.log(`User ${userId} stopped typing in team ${teamId}`);
      // Implementation would stop the typing indicator
    } catch (error) {
      console.warn('Failed to stop typing indicator:', error);
    }
  },

  // Send a poll message to chat
  async sendPollMessage(teamId, hackathonId, pollId, pollQuestion, creatorName) {
    try {
      const content = `📊 ${creatorName} created a poll: "${pollQuestion}"`;
      const systemData = {
        pollId,
        pollQuestion,
        createdBy: creatorName,
        type: 'poll'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'poll_created', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending poll message:', error);
      throw new Error('Failed to send poll message.');
    }
  },

  // Send poll result notification
  async sendPollResultMessage(teamId, hackathonId, pollId, pollQuestion, winners, totalVotes) {
    try {
      const winnerText = winners.length === 1 
        ? `"${winners[0]}"` 
        : `${winners.length} options tied`;
      
      const content = `📊 Poll "${pollQuestion}" has ended. Winner: ${winnerText} (${totalVotes} total votes)`;
      const systemData = {
        pollId,
        pollQuestion,
        winners,
        totalVotes,
        type: 'poll_result'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'poll_ended', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending poll result message:', error);
      throw new Error('Failed to send poll result message.');
    }
  },

  // Send poll vote notification
  async sendPollVoteMessage(teamId, hackathonId, pollId, pollQuestion, voterName, selectedOptions) {
    try {
      const optionText = selectedOptions.length === 1 
        ? `"${selectedOptions[0]}"` 
        : `${selectedOptions.length} options`;
      
      const content = `📊 ${voterName} voted ${optionText} in poll: "${pollQuestion}"`;
      const systemData = {
        pollId,
        pollQuestion,
        voterName,
        selectedOptions,
        type: 'poll_vote'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'poll_voted', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending poll vote message:', error);
      throw new Error('Failed to send poll vote message.');
    }
  },

  // Send poll to task conversion notification
  async sendPollToTaskMessage(teamId, hackathonId, pollId, pollQuestion, taskTitle, winningOption, creatorName) {
    try {
      const content = `📊➡️📝 ${creatorName} created task "${taskTitle}" from poll winner: "${winningOption}"`;
      const systemData = {
        pollId,
        pollQuestion,
        taskTitle,
        winningOption,
        createdBy: creatorName,
        type: 'poll_to_task'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'poll_converted_to_task', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending poll to task message:', error);
      throw new Error('Failed to send poll to task message.');
    }
  },

  // Send file upload notification
  async sendFileUploadMessage(teamId, hackathonId, fileName, uploaderName, fileType) {
    try {
      const content = `📁 ${uploaderName} uploaded a file: "${fileName}"`;
      const systemData = {
        fileName,
        uploaderName,
        fileType,
        type: 'file_upload'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'file_uploaded', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending file upload message:', error);
      throw new Error('Failed to send file upload message.');
    }
  },



  // Send celebration announcement
  async sendCelebrationMessage(teamId, hackathonId, celebrationType, triggerData) {
    try {
      let content;
      let systemData;

      switch (celebrationType) {
        case 'task_completion':
          content = `🎉 Task completed! "${triggerData.taskTitle}" is done! Great work, ${triggerData.completedBy}!`;
          systemData = {
            celebrationType,
            taskTitle: triggerData.taskTitle,
            completedBy: triggerData.completedBy,
            type: 'celebration'
          };
          break;
        case 'milestone':
          content = `🌟 Milestone reached! ${triggerData.description}`;
          systemData = {
            celebrationType,
            description: triggerData.description,
            milestone: triggerData.milestone,
            type: 'celebration'
          };
          break;
        case 'team_achievement':
          content = `🏆 Team achievement unlocked! ${triggerData.achievementName}`;
          systemData = {
            celebrationType,
            achievementName: triggerData.achievementName,
            teamMembers: triggerData.teamMembers,
            type: 'celebration'
          };
          break;
        default:
          content = `🎊 Something awesome happened! Let's celebrate!`;
          systemData = {
            celebrationType,
            data: triggerData,
            type: 'celebration'
          };
      }

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'celebration', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending celebration message:', error);
      throw new Error('Failed to send celebration message.');
    }
  },

  // Send bot motivational message
  async sendBotMotivationalMessage(teamId, hackathonId, message, context = 'general') {
    try {
      const systemData = {
        botType: 'motivational',
        context,
        type: 'bot_message'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        `🤖 ${message}`, 
        'bot_message', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending bot motivational message:', error);
      throw new Error('Failed to send bot motivational message.');
    }
  },

  // Send bot easter egg message
  async sendBotEasterEggMessage(teamId, hackathonId, command, message, triggeredBy) {
    try {
      const content = `🎊 ${triggeredBy} activated ${command}! ${message}`;
      const systemData = {
        command,
        triggeredBy,
        botType: 'easter_egg',
        type: 'bot_easter_egg'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'bot_easter_egg', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending bot easter egg message:', error);
      throw new Error('Failed to send bot easter egg message.');
    }
  },

  // Send bot contextual tip
  async sendBotTipMessage(teamId, hackathonId, tip, context = 'general') {
    try {
      const content = `💡 ${tip}`;
      const systemData = {
        botType: 'tip',
        context,
        type: 'bot_tip'
      };

      const response = await this.sendSystemMessage(
        teamId, 
        hackathonId, 
        content, 
        'bot_tip', 
        systemData
      );

      return response;
    } catch (error) {
      console.error('Error sending bot tip message:', error);
      throw new Error('Failed to send bot tip message.');
    }
  },

  // Message type filtering helper
  isValidMessageType(type) {
    const validTypes = [
      'user', 
      'system', 
      'task_created', 
      'task_status_changed', 
      'task_completed',
      'vault_secret_added', 
      'vault_secret_updated', 
      'vault_secret_deleted',
      'file_uploaded',
      'file_annotated',
      'bot_message',
      'bot_tip',
      'bot_easter_egg',
      'bot_contextual',
      'bot_help',
      'bot_reminder_scheduled'
    ];
    return validTypes.includes(type);
  }
};