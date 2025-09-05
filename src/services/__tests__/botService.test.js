import { describe, it, expect, vi, beforeEach } from 'vitest';
import botService from '../botService';
import { messageService } from '../messageService';

// Mock the message service
vi.mock('../messageService', () => ({
  messageService: {
    sendSystemMessage: vi.fn()
  }
}));

// Mock other services
vi.mock('../taskService', () => ({
  taskService: {
    getTasks: vi.fn()
  }
}));

vi.mock('../fileService', () => ({
  fileService: {
    getTeamFiles: vi.fn()
  }
}));

vi.mock('../ideaService', () => ({
  ideaService: {
    getTeamIdeas: vi.fn()
  }
}));

describe('BotService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendMotivationalMessage', () => {
    it('should send a motivational message through message service', async () => {
      const mockResponse = { $id: 'message-123', content: 'Test message' };
      messageService.sendSystemMessage.mockResolvedValue(mockResponse);

      const result = await botService.sendMotivationalMessage('team-123', 'hackathon-456', 'general');

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-456',
        expect.any(String),
        'bot_message',
        expect.objectContaining({
          botType: 'motivational',
          context: 'general',
          timestamp: expect.any(String)
        })
      );
      expect(result).toBe(mockResponse);
    });

    it('should select appropriate message based on context', async () => {
      messageService.sendSystemMessage.mockResolvedValue({});

      await botService.sendMotivationalMessage('team-123', 'hackathon-456', 'task_completed');

      const call = messageService.sendSystemMessage.mock.calls[0];
      const messageContent = call[2];
      
      // Should contain task completion related content
      expect(messageContent).toMatch(/task|completed|done|great|awesome/i);
    });
  });

  describe('triggerEasterEgg', () => {
    it('should trigger known easter egg commands', async () => {
      const mockResponse = { $id: 'message-123' };
      messageService.sendSystemMessage.mockResolvedValue(mockResponse);

      const result = await botService.triggerEasterEgg('/party', 'team-123', 'hackathon-456', 'TestUser');

      expect(result.found).toBe(true);
      expect(result.effect).toBeDefined();
      expect(result.effect.type).toBe('confetti');
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-456',
        expect.stringContaining('TestUser activated /party!'),
        'bot_easter_egg',
        expect.any(Object)
      );
    });

    it('should return not found for unknown commands', async () => {
      const result = await botService.triggerEasterEgg('/unknown', 'team-123', 'hackathon-456', 'TestUser');

      expect(result.found).toBe(false);
      expect(result.message).toContain("don't recognize that command");
      expect(messageService.sendSystemMessage).not.toHaveBeenCalled();
    });
  });

  describe('getContextualTips', () => {
    it('should return appropriate tips based on activity data', async () => {
      const activityData = {
        taskCount: 0,
        messageCount: 0,
        lastActivityHours: 5
      };

      const tips = await botService.getContextualTips(activityData);

      expect(tips).toBeInstanceOf(Array);
      expect(tips.length).toBeGreaterThan(0);
      expect(tips[0]).toContain('first task'); // Should suggest creating first task
    });

    it('should send tips to chat when requested', async () => {
      const activityData = { taskCount: 0 };
      messageService.sendSystemMessage.mockResolvedValue({});

      await botService.getContextualTips(activityData, 'team-123', 'hackathon-456', true);

      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-456',
        expect.stringContaining('💡'),
        'bot_tip',
        expect.any(Object)
      );
    });
  });

  describe('scheduleReminders', () => {
    it('should schedule reminders with default preferences', async () => {
      messageService.sendSystemMessage.mockResolvedValue({});

      const result = await botService.scheduleReminders('team-123', 'hackathon-456', {});

      expect(result).toHaveProperty('teamId', 'team-123');
      expect(result).toHaveProperty('hackathonId', 'hackathon-456');
      expect(result.preferences.frequency).toBe('hourly');
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-456',
        expect.stringContaining('Bot reminders are now active'),
        'bot_reminder_scheduled',
        expect.any(Object)
      );
    });

    it('should not send confirmation message when disabled', async () => {
      const result = await botService.scheduleReminders('team-123', 'hackathon-456', { enabled: false });

      expect(result.preferences.enabled).toBe(false);
      expect(messageService.sendSystemMessage).not.toHaveBeenCalled();
    });
  });

  describe('processMessageForEasterEggs', () => {
    it('should detect easter egg commands in messages', async () => {
      messageService.sendSystemMessage.mockResolvedValue({});

      const result = await botService.processMessageForEasterEggs('/party', 'team-123', 'hackathon-456', 'TestUser');

      expect(result.found).toBe(true);
      expect(result.type).toBeUndefined(); // Should be undefined for easter eggs
    });

    it('should respond to help requests', async () => {
      messageService.sendSystemMessage.mockResolvedValue({});

      const result = await botService.processMessageForEasterEggs('help bot', 'team-123', 'hackathon-456', 'TestUser');

      expect(result.found).toBe(true);
      expect(result.type).toBe('help');
      expect(messageService.sendSystemMessage).toHaveBeenCalledWith(
        'team-123',
        'hackathon-456',
        expect.stringContaining('friendly team bot'),
        'bot_help',
        expect.any(Object)
      );
    });

    it('should return null for regular messages', async () => {
      const result = await botService.processMessageForEasterEggs('regular message', 'team-123', 'hackathon-456', 'TestUser');

      expect(result).toBeNull();
      expect(messageService.sendSystemMessage).not.toHaveBeenCalled();
    });
  });

  describe('getWittyTooltip', () => {
    it('should return witty tooltip for known elements', () => {
      const tooltip = botService.getWittyTooltip('task_card');
      
      expect(typeof tooltip).toBe('string');
      expect(tooltip.length).toBeGreaterThan(0);
    });

    it('should return default tooltip for unknown elements', () => {
      const tooltip = botService.getWittyTooltip('unknown_element');
      
      expect(tooltip).toBe("I'm just here to help! 😊");
    });
  });

  describe('getSpecialDateTheme', () => {
    it('should return null for regular dates', () => {
      // Mock a regular date
      const originalDate = Date;
      global.Date = vi.fn(() => new originalDate('2024-06-15'));
      global.Date.now = originalDate.now;

      const theme = botService.getSpecialDateTheme();
      
      expect(theme).toBeNull();
      
      global.Date = originalDate;
    });

    it('should return Halloween theme on October 31', () => {
      const originalDate = Date;
      global.Date = vi.fn(() => new originalDate('2024-10-31'));
      global.Date.now = originalDate.now;

      const theme = botService.getSpecialDateTheme();
      
      expect(theme).not.toBeNull();
      expect(theme.theme).toBe('halloween');
      expect(theme.decorations).toContain('🎃');
      
      global.Date = originalDate;
    });
  });

  describe('determineTeamMood', () => {
    it('should return celebrating for high activity and progress', () => {
      const analysis = {
        completedTasks: 10,
        lastActivityHours: 1,
        messageCount: 20
      };

      const mood = botService.determineTeamMood(analysis);
      expect(mood).toBe('celebrating');
    });

    it('should return stuck for long inactivity', () => {
      const analysis = {
        completedTasks: 0,
        lastActivityHours: 10,
        inProgressTasks: 5
      };

      const mood = botService.determineTeamMood(analysis);
      expect(mood).toBe('stuck');
    });

    it('should return productive for normal activity', () => {
      const analysis = {
        completedTasks: 3,
        lastActivityHours: 2,
        messageCount: 15
      };

      const mood = botService.determineTeamMood(analysis);
      expect(mood).toBe('productive');
    });
  });

  describe('shouldSendMessage', () => {
    it('should recommend high priority message for stuck teams', async () => {
      // Mock analyzeTeamActivity to return stuck team data
      const originalAnalyze = botService.analyzeTeamActivity;
      botService.analyzeTeamActivity = vi.fn().mockResolvedValue({
        lastActivityHours: 10,
        inProgressTasks: 5,
        completedTasks: 0
      });

      const recommendation = await botService.shouldSendMessage('team-123', 'hackathon-456');

      expect(recommendation.shouldSend).toBe(true);
      expect(recommendation.priority).toBe('high');
      expect(recommendation.reason).toBe('long_inactivity');

      botService.analyzeTeamActivity = originalAnalyze;
    });

    it('should not recommend message for active teams', async () => {
      const originalAnalyze = botService.analyzeTeamActivity;
      botService.analyzeTeamActivity = vi.fn().mockResolvedValue({
        lastActivityHours: 1,
        completedTasks: 2,
        messageCount: 10
      });

      const recommendation = await botService.shouldSendMessage('team-123', 'hackathon-456');

      expect(recommendation.shouldSend).toBe(false);

      botService.analyzeTeamActivity = originalAnalyze;
    });
  });
});