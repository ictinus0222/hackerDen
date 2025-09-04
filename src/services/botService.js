import { databases, DATABASE_ID, COLLECTIONS, Query } from '@/lib/appwrite';

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
   * @param {string} context - Context for message selection
   * @returns {Promise<void>}
   */
  async sendMotivationalMessage(teamId, context = 'general') {
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
      
      // This will integrate with the existing message service
      // For now, just log the message that would be sent
      console.log(`🤖 Bot message for team ${teamId}:`, message);
      
      return message;
    } catch (error) {
      console.error('Error sending motivational message:', error);
      throw error;
    }
  }

  /**
   * Handle easter egg commands
   * @param {string} command - Easter egg command (e.g., '/party')
   * @param {string} teamId - Team identifier
   * @returns {Promise<Object>} Easter egg response
   */
  async triggerEasterEgg(command, teamId) {
    try {
      const easterEggs = this.constructor.BOT_MESSAGES.EASTER_EGGS;
      
      if (!easterEggs[command]) {
        return {
          found: false,
          message: "🤔 Hmm, I don't recognize that command. Try /party or /celebrate!"
        };
      }

      const response = {
        found: true,
        message: easterEggs[command],
        effect: this.getEasterEggEffect(command),
        teamId
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
   * @returns {Promise<Array>} Array of contextual tips
   */
  async getContextualTips(activityData) {
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

      return tips;
    } catch (error) {
      console.error('Error getting contextual tips:', error);
      return [this.getRandomMessage(this.constructor.BOT_MESSAGES.TIPS)];
    }
  }

  /**
   * Schedule reminder messages
   * @param {string} teamId - Team identifier
   * @param {Object} preferences - Bot preferences (frequency, types)
   * @returns {Promise<void>}
   */
  async scheduleReminders(teamId, preferences) {
    try {
      // This would integrate with a scheduling system
      // For now, just log the scheduling request
      console.log(`📅 Reminders scheduled for team ${teamId}:`, preferences);
      
      // Example preferences structure:
      // {
      //   frequency: 'hourly' | 'daily' | 'disabled',
      //   types: ['motivational', 'tips', 'progress'],
      //   quietHours: { start: '22:00', end: '08:00' }
      // }
    } catch (error) {
      console.error('Error scheduling reminders:', error);
      throw error;
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
   * @returns {Promise<Object>} Activity analysis
   */
  async analyzeTeamActivity(teamId) {
    try {
      // This would integrate with existing services to gather activity data
      // For now, return a mock analysis structure
      return {
        taskCount: 0,
        todoTasks: 0,
        completedTasks: 0,
        messageCount: 0,
        fileCount: 0,
        ideaCount: 0,
        lastActivityHours: 0,
        recentPoll: false,
        teamMood: 'productive', // productive, stuck, celebrating
        suggestions: []
      };
    } catch (error) {
      console.error('Error analyzing team activity:', error);
      return {
        taskCount: 0,
        todoTasks: 0,
        completedTasks: 0,
        messageCount: 0,
        fileCount: 0,
        ideaCount: 0,
        lastActivityHours: 0,
        recentPoll: false,
        teamMood: 'unknown',
        suggestions: []
      };
    }
  }
}

export default new BotService();