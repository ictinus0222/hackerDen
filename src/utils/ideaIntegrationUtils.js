/**
 * @fileoverview Utility functions for idea system integration
 * Provides helper functions for idea-to-task conversion and threshold management
 */

/**
 * Default vote threshold for auto-approval
 */
export const DEFAULT_VOTE_THRESHOLD = 3;

/**
 * Vote threshold for high priority tasks
 */
export const HIGH_PRIORITY_THRESHOLD = 5;

/**
 * Determines task priority based on idea vote count
 * @param {number} voteCount - Number of votes the idea received
 * @returns {string} Task priority ('high' or 'medium')
 */
export const getTaskPriorityFromVotes = (voteCount) => {
  return voteCount >= HIGH_PRIORITY_THRESHOLD ? 'high' : 'medium';
};

/**
 * Formats idea description for task conversion
 * @param {string} originalDescription - Original idea description
 * @param {number} voteCount - Number of votes the idea received
 * @returns {string} Formatted description with vote information
 */
export const formatIdeaDescriptionForTask = (originalDescription, voteCount) => {
  const voteInfo = `\n\n_Converted from idea with ${voteCount} votes_`;
  return originalDescription + voteInfo;
};

/**
 * Generates system message content for idea activities
 * @param {string} type - Type of activity ('created', 'voted', 'approved', 'converted')
 * @param {Object} data - Activity data
 * @returns {string} Formatted system message content
 */
export const generateIdeaSystemMessage = (type, data) => {
  const { userName, ideaTitle, voteCount, threshold } = data;
  
  switch (type) {
    case 'created':
      return `💡 ${userName} submitted a new idea: "${ideaTitle}"`;
    
    case 'voted':
      return `👍 ${userName} voted on idea: "${ideaTitle}" (${voteCount} votes)`;
    
    case 'auto_approved':
      return `🎉 Idea "${ideaTitle}" was automatically approved with ${voteCount} votes!`;
    
    case 'converted':
      return `🔄 ${userName} converted idea "${ideaTitle}" to a task (${voteCount} votes)`;
    
    case 'status_changed':
      return `${getStatusEmoji(data.newStatus)} ${userName} changed idea "${ideaTitle}" from ${data.oldStatus} to ${data.newStatus}`;
    
    default:
      return `📝 Idea "${ideaTitle}" was updated by ${userName}`;
  }
};

/**
 * Gets emoji for idea status
 * @param {string} status - Idea status
 * @returns {string} Status emoji
 */
export const getStatusEmoji = (status) => {
  const statusEmojis = {
    'submitted': '💡',
    'approved': '✅',
    'in_progress': '🔄',
    'completed': '🎉',
    'rejected': '❌'
  };
  
  return statusEmojis[status] || '🔄';
};

/**
 * Validates idea status transition
 * @param {string} currentStatus - Current idea status
 * @param {string} newStatus - New idea status
 * @returns {boolean} Whether the transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'submitted': ['approved', 'rejected'],
    'approved': ['in_progress', 'rejected'],
    'in_progress': ['completed', 'approved'],
    'completed': ['approved'], // Allow reopening completed ideas
    'rejected': ['submitted'] // Allow resubmitting rejected ideas
  };
  
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Checks if an idea should be auto-approved based on vote count
 * @param {number} voteCount - Current vote count
 * @param {string} status - Current idea status
 * @param {number} threshold - Vote threshold for auto-approval
 * @returns {boolean} Whether the idea should be auto-approved
 */
export const shouldAutoApprove = (voteCount, status, threshold = DEFAULT_VOTE_THRESHOLD) => {
  return status === 'submitted' && voteCount >= threshold;
};

/**
 * Creates system data object for idea activities
 * @param {string} type - Activity type
 * @param {Object} ideaData - Idea data
 * @param {Object} additionalData - Additional activity-specific data
 * @returns {Object} System data object for chat messages
 */
export const createIdeaSystemData = (type, ideaData, additionalData = {}) => {
  const baseData = {
    ideaId: ideaData.$id || ideaData.ideaId,
    ideaTitle: ideaData.title || ideaData.ideaTitle,
    voteCount: ideaData.voteCount
  };
  
  return {
    ...baseData,
    ...additionalData
  };
};