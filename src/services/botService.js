import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';
import { messageService } from './messageService';
import { taskService } from './taskService';
import { fileService } from './fileService';

/**
 * Bot Service for system bot interactions and UX enhancements
 * Handles motivational messages, easter eggs, contextual tips, and celebrations
 */
class BotService {
  // Bot personality and message templates
  static BOT_MESSAGES = {
    MOTIVATIONAL: [
      "🚀 Keep up the great work! Your team is making awesome progress!",
      "💪 You're crushing it! Every line of code brings you closer to victory!",
      "🔥 The energy is strong with this team! Keep the momentum going!",
      "⭐ Amazing teamwork! You're building something incredible!",
      "🎯 Focus mode activated! You've got this, team!",
      "🌟 Your dedication is inspiring! Keep pushing forward!",
      "🏆 Champions in the making! Every task completed is a step toward greatness!"
    ],
    TASK_COMPLETION: [
      "🎉 Task completed! Another step closer to hackathon glory!",
      "✅ Boom! That task didn't stand a chance!",
      "🚀 Task crushed! Your team's efficiency is off the charts!",
      "💥 Another one bites the dust! Great job!",
      "🎯 Bullseye! Task completed with style!",
      "⚡ Lightning fast! Task completed in record time!",
      "🏅 Task mastery achieved! You're on fire!"
    ],
    ACHIEVEMENT_UNLOCK: [
      "🏆 Achievement unlocked! You're leveling up!",
      "🌟 New badge earned! Your skills are showing!",
      "🎖️ Congratulations! Another milestone reached!",
      "💎 Shiny new achievement! You're collecting them all!",
      "🏅 Badge of honor earned! Well deserved!",
      "⭐ Achievement get! Your progress is stellar!",
      "🎊 New achievement! You're becoming legendary!"
    ],
    TIPS: [
      "💡 Pro tip: Use drag and drop to reorganize your tasks efficiently!",
      "🔧 Remember: The team vault is perfect for sharing API keys securely!",
      "📝 Tip: Add detailed descriptions to tasks for better team coordination!",
      "🎨 Fun fact: You can customize your task priorities with colors!",
      "⚡ Speed tip: Use keyboard shortcuts to navigate faster!",
      "🤝 Collaboration tip: @mention teammates in messages for better communication!",
      "📊 Progress tip: Check the team dashboard regularly to stay aligned!"
    ],
    EASTER_EGGS: {
      '/party': "🎉🎊🥳 PARTY TIME! 🥳🎊🎉 Everyone dance! 💃🕺",
      '/celebrate': "🎆🎇✨ CELEBRATION MODE ACTIVATED! ✨🎇🎆",
      '/coffee': "☕ Coffee break time! ☕ Fuel up for more coding!",
      '/pizza': "🍕 Pizza party! 🍕 The ultimate developer fuel!",
      '/rocket': "🚀🌟 TO THE MOON! 🌟🚀 Your project is taking off!",
      '/magic': "✨🪄 *waves magic wand* ✨ May your code be bug-free! 🪄✨",
      '/ninja': "🥷 Ninja mode activated! 🥷 Stealthy coding in progress...",
      '/unicorn': "🦄✨ Unicorn power! ✨🦄 Making the impossible possible!"
    }
  };

  static CONTEXTUAL_TIPS = {
    NO_TASKS: "🎯 Ready to start? Create your first task to get the ball rolling!",
    MANY_TODO: "📋 Lots of tasks in TODO? Try moving some to IN PROGRESS to balance the workload!",
    NO_MESSAGES: "💬 Communication is key! Start a conversation with your team!",
    LONG_INACTIVE: "⏰ It's been quiet here! How about a quick team check-in?",
    MANY_DONE: "🏆 Impressive progress! You're really getting things done!",
    NO_FILES: "📁 Consider sharing files with your team for better collaboration!",
    FIRST_IDEA: "💡 Great first idea! Encourage your team to share more thoughts!",
    POLL_CREATED: "🗳️ New poll created! Make sure everyone gets a chance to vote!"
  };

  /**
   * Send a motivational message to team chat
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {string} context - Context for message selection
   * @returns {Promise<Object>} Sent message
   */
  async sendMotivationalMessage(teamId, hackathonId, context = 'general') {
    try {
      let messages;
      
      switch (context) {
        case 'task_completed':
          messages = this.constructor.BOT_MESSAGES.TASK_COMPLETION;
          break;
        case 'achievement':
          messages = this.constructor.BOT_MESSAGES.ACHIEVEMENT_UNLOCK;
          break;
        default:
          messages = this.constructor.BOT_MESSAGES.MOTIVATIONAL;
      }

      const message = this.getRandomMessage(messages);
      
      // Send bot message through message service
      const response = await messageService.sendBotMotivationalMessage(
        teamId,
        hackathonId,
        message,
        context
      );
      
      console.log(`🤖 Bot message sent to team ${teamId}:`, message);
      return response;
    } catch (error) {
      console.error('Error sending motivational message:', error);
      throw error;
    }
  }

  /**
   * Handle easter egg commands
   * @param {string} command - Easter egg command (e.g., '/party')
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {string} triggeredBy - User who triggered the easter egg
   * @returns {Promise<Object>} Easter egg response
   */
  async triggerEasterEgg(command, teamId, hackathonId, triggeredBy = 'Someone') {
    try {
      const easterEggs = this.constructor.BOT_MESSAGES.EASTER_EGGS;
      
      if (!easterEggs[command]) {
        return {
          found: false,
          message: "🤔 Hmm, I don't recognize that command. Try /party or /celebrate!"
        };
      }

      const message = easterEggs[command];
      const effect = this.getEasterEggEffect(command);

      // Send easter egg message to chat
      const chatMessage = await messageService.sendBotEasterEggMessage(
        teamId,
        hackathonId,
        command,
        message,
        triggeredBy
      );

      const response = {
        found: true,
        message,
        effect,
        teamId,
        chatMessage
      };

      console.log(`🎊 Easter egg triggered: ${command}`, response);
      
      return response;
    } catch (error) {
      console.error('Error triggering easter egg:', error);
      throw error;
    }
  }

  /**
   * Get contextual tips based on team activity
   * @param {Object} activityData - Team activity data
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {boolean} sendToChat - Whether to send tips to chat
   * @returns {Promise<Array>} Array of contextual tips
   */
  async getContextualTips(activityData, teamId = null, hackathonId = null, sendToChat = false) {
    try {
      const tips = [];
      const contextualTips = this.constructor.CONTEXTUAL_TIPS;

      // Analyze activity and suggest appropriate tips
      if (activityData.taskCount === 0) {
        tips.push(contextualTips.NO_TASKS);
      }

      if (activityData.todoTasks > 10) {
        tips.push(contextualTips.MANY_TODO);
      }

      if (activityData.messageCount === 0) {
        tips.push(contextualTips.NO_MESSAGES);
      }

      if (activityData.lastActivityHours > 4) {
        tips.push(contextualTips.LONG_INACTIVE);
      }

      if (activityData.completedTasks > 20) {
        tips.push(contextualTips.MANY_DONE);
      }

      if (activityData.fileCount === 0) {
        tips.push(contextualTips.NO_FILES);
      }

      if (activityData.ideaCount === 1) {
        tips.push(contextualTips.FIRST_IDEA);
      }

      if (activityData.recentPoll) {
        tips.push(contextualTips.POLL_CREATED);
      }

      // Add general tips if no specific context
      if (tips.length === 0) {
        tips.push(this.getRandomMessage(this.constructor.BOT_MESSAGES.TIPS));
      }

      // Send tips to chat if requested
      if (sendToChat && teamId && hackathonId && tips.length > 0) {
        const tip = tips[0]; // Send the most relevant tip
        await messageService.sendBotTipMessage(
          teamId,
          hackathonId,
          tip,
          'contextual'
        );
      }

      return tips;
    } catch (error) {
      console.error('Error getting contextual tips:', error);
      return [this.getRandomMessage(this.constructor.BOT_MESSAGES.TIPS)];
    }
  }

  /**
   * Schedule reminder messages
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {Object} preferences - Bot preferences (frequency, types)
   * @returns {Promise<Object>} Scheduling result
   */
  async scheduleReminders(teamId, hackathonId, preferences) {
    try {
      const defaultPreferences = {
        frequency: 'hourly',
        types: ['motivational', 'tips', 'progress'],
        quietHours: { start: '22:00', end: '08:00' },
        enabled: true
      };

      const finalPreferences = { ...defaultPreferences, ...preferences };
      
      // Store preferences (in a real implementation, this would be in a database)
      const schedulingData = {
        teamId,
        hackathonId,
        preferences: finalPreferences,
        lastReminder: null,
        nextReminder: this.calculateNextReminderTime(finalPreferences),
        createdAt: new Date().toISOString()
      };

      // In a production environment, this would integrate with a job scheduler
      // For now, we'll simulate the scheduling
      console.log(`📅 Reminders scheduled for team ${teamId}:`, schedulingData);

      // Send confirmation message
      if (finalPreferences.enabled) {
        await messageService.sendSystemMessage(
          teamId,
          hackathonId,
          `🤖 Bot reminders are now active! I'll send ${finalPreferences.frequency} updates to keep your team motivated and on track.`,
          'bot_reminder_scheduled',
          {
            preferences: finalPreferences,
            timestamp: new Date().toISOString()
          }
        );
      }

      return schedulingData;
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
    }
  }

  /**
   * Calculate next reminder time based on preferences
   * @param {Object} preferences - Bot preferences
   * @returns {Date} Next reminder time
   */
  calculateNextReminderTime(preferences) {
    const now = new Date();
    let nextTime = new Date(now);

    switch (preferences.frequency) {
      case 'hourly':
        nextTime.setHours(now.getHours() + 1);
        break;
      case 'daily':
        nextTime.setDate(now.getDate() + 1);
        nextTime.setHours(9, 0, 0, 0); // 9 AM next day
        break;
      case 'disabled':
        return null;
      default:
        nextTime.setHours(now.getHours() + 2); // Default to 2 hours
    }

    // Check quiet hours
    if (preferences.quietHours) {
      const quietStart = this.parseTime(preferences.quietHours.start);
      const quietEnd = this.parseTime(preferences.quietHours.end);
      const nextHour = nextTime.getHours();

      if (this.isInQuietHours(nextHour, quietStart, quietEnd)) {
        // Schedule for after quiet hours
        nextTime.setHours(quietEnd, 0, 0, 0);
        if (nextTime <= now) {
          nextTime.setDate(nextTime.getDate() + 1);
        }
      }
    }

    return nextTime;
  }

  /**
   * Parse time string to hour number
   * @param {string} timeStr - Time string like "22:00"
   * @returns {number} Hour number
   */
  parseTime(timeStr) {
    return parseInt(timeStr.split(':')[0], 10);
  }

  /**
   * Check if hour is in quiet hours
   * @param {number} hour - Hour to check
   * @param {number} quietStart - Quiet hours start
   * @param {number} quietEnd - Quiet hours end
   * @returns {boolean} Is in quiet hours
   */
  isInQuietHours(hour, quietStart, quietEnd) {
    if (quietStart <= quietEnd) {
      return hour >= quietStart && hour < quietEnd;
    } else {
      // Quiet hours span midnight
      return hour >= quietStart || hour < quietEnd;
    }
  }

  /**
   * Get random message from array
   * @param {Array} messages - Array of messages
   * @returns {string} Random message
   */
  getRandomMessage(messages) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Get easter egg effect configuration
   * @param {string} command - Easter egg command
   * @returns {Object} Effect configuration
   */
  getEasterEggEffect(command) {
    const effects = {
      '/party': {
        type: 'confetti',
        duration: 3000,
        colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
      },
      '/celebrate': {
        type: 'fireworks',
        duration: 5000,
        colors: ['#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43']
      },
      '/coffee': {
        type: 'steam',
        duration: 2000,
        icon: '☕'
      },
      '/pizza': {
        type: 'bounce',
        duration: 2000,
        icon: '🍕'
      },
      '/rocket': {
        type: 'launch',
        duration: 4000,
        icon: '🚀'
      },
      '/magic': {
        type: 'sparkle',
        duration: 3000,
        icon: '✨'
      },
      '/ninja': {
        type: 'stealth',
        duration: 2000,
        icon: '🥷'
      },
      '/unicorn': {
        type: 'rainbow',
        duration: 4000,
        icon: '🦄'
      }
    };

    return effects[command] || { type: 'none', duration: 0 };
  }

  /**
   * Generate witty tooltip content
   * @param {string} element - UI element type
   * @returns {string} Witty tooltip text
   */
  getWittyTooltip(element) {
    const tooltips = {
      task_card: [
        "This task is ready for action! 🎯",
        "Click me! I won't bite... much 😄",
        "I'm just a humble task, waiting to be completed 📝",
        "Ready to make some progress? Let's go! 🚀"
      ],
      delete_button: [
        "Are you sure? I had such potential! 😢",
        "Delete me if you must, but I'll be back! 👻",
        "This is the end... my only friend, the end 🎭",
        "To delete or not to delete, that is the question 🤔"
      ],
      file_upload: [
        "Drop it like it's hot! 🔥",
        "Files welcome! No judgment here 📁",
        "Drag, drop, and let the magic happen ✨",
        "Your files are safe with me! 🛡️"
      ],
      vote_button: [
        "Democracy in action! Your vote matters! 🗳️",
        "Click to make your voice heard! 📢",
        "Every vote counts in this digital democracy! 🏛️",
        "Be the change you want to see! ✊"
      ]
    };

    const elementTooltips = tooltips[element] || ["I'm just here to help! 😊"];
    return this.getRandomMessage(elementTooltips);
  }

  /**
   * Check for special dates and return themed content
   * @returns {Object|null} Special date theme or null
   */
  getSpecialDateTheme() {
    const now = new Date();
    const month = now.getMonth() + 1; // 1-12
    const day = now.getDate();

    // Halloween
    if (month === 10 && day === 31) {
      return {
        theme: 'halloween',
        message: "🎃 Happy Halloween! May your code be spook-free! 👻",
        decorations: ['🎃', '👻', '🕷️', '🦇'],
        colors: ['#ff6b35', '#2d1b69', '#000000']
      };
    }

    // New Year
    if (month === 1 && day === 1) {
      return {
        theme: 'new_year',
        message: "🎊 Happy New Year! Time for new code resolutions! 🎆",
        decorations: ['🎊', '🎆', '🥳', '✨'],
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4']
      };
    }

    // April Fools
    if (month === 4 && day === 1) {
      return {
        theme: 'april_fools',
        message: "🃏 April Fools! But your code is no joke! 😄",
        decorations: ['🃏', '😄', '🎭', '🤡'],
        colors: ['#ff6b6b', '#4ecdc4', '#feca57']
      };
    }

    return null;
  }

  /**
   * Analyze team activity for bot intelligence
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @returns {Promise<Object>} Activity analysis
   */
  async analyzeTeamActivity(teamId, hackathonId) {
    try {
      const analysis = {
        taskCount: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        messageCount: 0,
        fileCount: 0,
        ideaCount: 0,
        lastActivityHours: 0,
        recentPoll: false,
        teamMood: 'productive',
        suggestions: []
      };

      // Get task data
      try {
        const tasks = await taskService.getTasks(teamId, hackathonId);
        analysis.taskCount = tasks.length;
        analysis.todoTasks = tasks.filter(t => t.status === 'todo').length;
        analysis.inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        analysis.completedTasks = tasks.filter(t => t.status === 'done').length;

        // Calculate last task activity
        if (tasks.length > 0) {
          const lastTaskUpdate = Math.max(...tasks.map(t => new Date(t.$updatedAt).getTime()));
          analysis.lastActivityHours = (Date.now() - lastTaskUpdate) / (1000 * 60 * 60);
        }
      } catch (error) {
        console.warn('Could not fetch task data for analysis:', error);
      }

      // Get message data
      try {
        const messages = await messageService.getMessages(teamId, hackathonId, 50);
        analysis.messageCount = messages.total || messages.messages?.length || 0;

        // Check for recent activity
        if (messages.messages && messages.messages.length > 0) {
          const lastMessage = messages.messages[messages.messages.length - 1];
          const lastMessageTime = new Date(lastMessage.$createdAt).getTime();
          const messageActivityHours = (Date.now() - lastMessageTime) / (1000 * 60 * 60);
          analysis.lastActivityHours = Math.min(analysis.lastActivityHours, messageActivityHours);
        }
      } catch (error) {
        console.warn('Could not fetch message data for analysis:', error);
      }

      // Get file data if fileService is available
      try {
        if (fileService && fileService.getTeamFiles) {
          const files = await fileService.getTeamFiles(teamId);
          analysis.fileCount = files.length;
        }
      } catch (error) {
        console.warn('Could not fetch file data for analysis:', error);
      }

      // Ideas Management Flow has been removed for final submission
      analysis.ideaCount = 0;

      // Determine team mood based on activity
      analysis.teamMood = this.determineTeamMood(analysis);

      // Generate suggestions based on analysis
      analysis.suggestions = this.generateSuggestions(analysis);

      return analysis;
    } catch (error) {
      console.error('Error analyzing team activity:', error);
      return {
        taskCount: 0,
        todoTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        messageCount: 0,
        fileCount: 0,
        ideaCount: 0,
        lastActivityHours: 24,
        recentPoll: false,
        teamMood: 'unknown',
        suggestions: []
      };
    }
  }

  /**
   * Determine team mood based on activity analysis
   * @param {Object} analysis - Activity analysis data
   * @returns {string} Team mood
   */
  determineTeamMood(analysis) {
    // High activity and progress
    if (analysis.completedTasks > 5 && analysis.lastActivityHours < 2) {
      return 'celebrating';
    }

    // Good progress and communication
    if (analysis.completedTasks > 0 && analysis.messageCount > 10 && analysis.lastActivityHours < 4) {
      return 'productive';
    }

    // Low activity or stuck
    if (analysis.lastActivityHours > 8 || (analysis.inProgressTasks > 5 && analysis.completedTasks === 0)) {
      return 'stuck';
    }

    // Starting out
    if (analysis.taskCount < 3 && analysis.messageCount < 5) {
      return 'getting_started';
    }

    return 'productive';
  }

  /**
   * Generate suggestions based on activity analysis
   * @param {Object} analysis - Activity analysis data
   * @returns {Array} Array of suggestions
   */
  generateSuggestions(analysis) {
    const suggestions = [];

    if (analysis.taskCount === 0) {
      suggestions.push('Create your first tasks to get organized!');
    }

    if (analysis.todoTasks > 10) {
      suggestions.push('Consider breaking down large tasks or moving some to in-progress.');
    }

    if (analysis.messageCount === 0) {
      suggestions.push('Start team communication to coordinate better!');
    }

    if (analysis.lastActivityHours > 6) {
      suggestions.push('Time for a team check-in! How is everyone doing?');
    }

    if (analysis.completedTasks > 10) {
      suggestions.push('Amazing progress! Consider celebrating your achievements!');
    }

    if (analysis.fileCount === 0) {
      suggestions.push('Share files with your team for better collaboration.');
    }

    return suggestions;
  }
  /**
   * Send contextual message based on team activity
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {string} trigger - What triggered the message
   * @returns {Promise<Object>} Sent message
   */
  async sendContextualMessage(teamId, hackathonId, trigger) {
    try {
      const activity = await this.analyzeTeamActivity(teamId, hackathonId);
      let message = '';
      let messageType = 'bot_contextual';

      switch (trigger) {
        case 'task_completed':
          if (activity.completedTasks === 1) {
            message = "🎉 First task completed! You're off to a great start!";
          } else if (activity.completedTasks % 5 === 0) {
            message = `🏆 ${activity.completedTasks} tasks completed! Your team is on fire!`;
          } else {
            message = this.getRandomMessage(this.constructor.BOT_MESSAGES.TASK_COMPLETION);
          }
          break;

        case 'long_inactivity':
          message = "👋 It's been quiet here! How about a quick team sync to keep the momentum going?";
          break;

        case 'many_todo_tasks':
          message = "📋 Lots of tasks in the TODO column! Consider moving some to IN PROGRESS to balance the workload.";
          break;

        case 'first_message':
          message = "💬 Great to see the team communicating! Keep the conversation flowing for better coordination.";
          break;

        case 'milestone_reached':
          message = "🌟 Milestone reached! Your dedication is paying off. Keep pushing forward!";
          break;

        default:
          message = this.getRandomMessage(this.constructor.BOT_MESSAGES.MOTIVATIONAL);
      }

      const response = await messageService.sendBotMotivationalMessage(
        teamId,
        hackathonId,
        message,
        trigger
      );

      return response;
    } catch (error) {
      console.error('Error sending contextual message:', error);
      throw error;
    }
  }

  /**
   * Check if bot should send a message based on activity patterns
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @returns {Promise<Object>} Recommendation for bot action
   */
  async shouldSendMessage(teamId, hackathonId) {
    try {
      const activity = await this.analyzeTeamActivity(teamId, hackathonId);
      
      const recommendations = {
        shouldSend: false,
        reason: null,
        messageType: null,
        priority: 'low'
      };

      // High priority: Team seems stuck
      if (activity.lastActivityHours > 8 && activity.inProgressTasks > 0) {
        recommendations.shouldSend = true;
        recommendations.reason = 'long_inactivity';
        recommendations.messageType = 'motivational';
        recommendations.priority = 'high';
      }

      // Medium priority: Good progress milestone
      else if (activity.completedTasks > 0 && activity.completedTasks % 5 === 0) {
        recommendations.shouldSend = true;
        recommendations.reason = 'milestone_reached';
        recommendations.messageType = 'celebration';
        recommendations.priority = 'medium';
      }

      // Low priority: Regular encouragement
      else if (activity.lastActivityHours > 2 && activity.lastActivityHours < 4) {
        recommendations.shouldSend = true;
        recommendations.reason = 'regular_encouragement';
        recommendations.messageType = 'motivational';
        recommendations.priority = 'low';
      }

      return recommendations;
    } catch (error) {
      console.error('Error checking if bot should send message:', error);
      return { shouldSend: false, reason: 'error', messageType: null, priority: 'low' };
    }
  }

  /**
   * Process user message for easter egg commands
   * @param {string} messageContent - User message content
   * @param {string} teamId - Team identifier
   * @param {string} hackathonId - Hackathon identifier
   * @param {string} userName - User who sent the message
   * @returns {Promise<Object|null>} Easter egg response or null
   */
  async processMessageForEasterEggs(messageContent, teamId, hackathonId, userName) {
    try {
      const content = messageContent.trim().toLowerCase();
      
      // Check for easter egg commands
      const easterEggCommands = Object.keys(this.constructor.BOT_MESSAGES.EASTER_EGGS);
      const foundCommand = easterEggCommands.find(cmd => content === cmd);

      if (foundCommand) {
        return await this.triggerEasterEgg(foundCommand, teamId, hackathonId, userName);
      }

      // Check for other special patterns
      if (content.includes('help') && content.includes('bot')) {
        await messageService.sendBotMotivationalMessage(
          teamId,
          hackathonId,
          "Hi there! I'm your friendly team bot. Try commands like /party, /celebrate, /coffee, or /pizza for some fun! I also send motivational messages and tips to keep your team energized!",
          'help'
        );
        return { found: true, type: 'help' };
      }

      return null;
    } catch (error) {
      console.error('Error processing message for easter eggs:', error);
      return null;
    }
  }

  /**
   * Get bot status and configuration
   * @param {string} teamId - Team identifier
   * @returns {Promise<Object>} Bot status
   */
  async getBotStatus(teamId) {
    try {
      // In a real implementation, this would fetch from database
      return {
        enabled: true,
        personality: 'friendly',
        reminderFrequency: 'hourly',
        easterEggsEnabled: true,
        contextualTipsEnabled: true,
        lastActivity: new Date().toISOString(),
        messagesCount: 0, // Would track bot messages sent
        easterEggsTriggered: 0
      };
    } catch (error) {
      console.error('Error getting bot status:', error);
      return {
        enabled: false,
        personality: 'friendly',
        reminderFrequency: 'disabled',
        easterEggsEnabled: false,
        contextualTipsEnabled: false,
        lastActivity: null,
        messagesCount: 0,
        easterEggsTriggered: 0
      };
    }
  }

  /**
   * Update bot configuration
   * @param {string} teamId - Team identifier
   * @param {Object} config - Bot configuration
   * @returns {Promise<Object>} Updated configuration
   */
  async updateBotConfig(teamId, config) {
    try {
      // In a real implementation, this would save to database
      const updatedConfig = {
        enabled: config.enabled ?? true,
        personality: config.personality ?? 'friendly',
        reminderFrequency: config.reminderFrequency ?? 'hourly',
        easterEggsEnabled: config.easterEggsEnabled ?? true,
        contextualTipsEnabled: config.contextualTipsEnabled ?? true,
        updatedAt: new Date().toISOString()
      };

      console.log(`🤖 Bot config updated for team ${teamId}:`, updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error updating bot config:', error);
      throw error;
    }
  }
}

export default new BotService();