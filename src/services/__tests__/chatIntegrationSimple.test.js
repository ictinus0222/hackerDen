/**
 * @fileoverview Simple integration test for enhancement chat notifications
 * Tests that the message service has all required methods for enhancement integration
 */

import { describe, it, expect } from 'vitest';
import { messageService } from '../messageService';

describe('Enhancement Chat Integration - Message Service Methods', () => {
  it('should have all required enhancement message methods', () => {
    // Verify all enhancement message methods exist
    expect(typeof messageService.sendFileUploadMessage).toBe('function');
    expect(typeof messageService.sendFileAnnotationMessage).toBe('function');
    expect(typeof messageService.sendAchievementMessage).toBe('function');
    expect(typeof messageService.sendCelebrationMessage).toBe('function');
    expect(typeof messageService.sendBotMotivationalMessage).toBe('function');
    expect(typeof messageService.sendBotEasterEggMessage).toBe('function');
    expect(typeof messageService.sendBotTipMessage).toBe('function');
  });

  it('should have updated message type validation', () => {
    // Test that new message types are valid
    expect(messageService.isValidMessageType('file_uploaded')).toBe(true);
    expect(messageService.isValidMessageType('file_annotated')).toBe(true);
    expect(messageService.isValidMessageType('achievement_unlocked')).toBe(true);
    expect(messageService.isValidMessageType('celebration')).toBe(true);
    expect(messageService.isValidMessageType('bot_message')).toBe(true);
    expect(messageService.isValidMessageType('bot_tip')).toBe(true);
    expect(messageService.isValidMessageType('bot_easter_egg')).toBe(true);
    
    // Test that invalid types are rejected
    expect(messageService.isValidMessageType('invalid_type')).toBe(false);
  });

  it('should maintain existing message types', () => {
    // Verify existing MVP message types still work
    expect(messageService.isValidMessageType('user')).toBe(true);
    expect(messageService.isValidMessageType('system')).toBe(true);
    expect(messageService.isValidMessageType('task_created')).toBe(true);
    expect(messageService.isValidMessageType('task_status_changed')).toBe(true);
    expect(messageService.isValidMessageType('task_completed')).toBe(true);
    expect(messageService.isValidMessageType('vault_secret_added')).toBe(true);
  });

  it('should have poll integration methods', () => {
    // Verify poll-related methods exist (these were already implemented)
    expect(typeof messageService.sendPollMessage).toBe('function');
    expect(typeof messageService.sendPollResultMessage).toBe('function');
    expect(typeof messageService.sendPollVoteMessage).toBe('function');
    expect(typeof messageService.sendPollToTaskMessage).toBe('function');
  });
});