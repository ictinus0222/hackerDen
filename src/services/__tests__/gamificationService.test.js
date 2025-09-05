/**
 * @fileoverview Tests for GamificationService
 */

import { describe, it, expect } from 'vitest';
import { gamificationService } from '../gamificationService';

describe('GamificationService', () => {
  describe('getPointValues', () => {
    it('should return point values for different actions', () => {
      const pointValues = gamificationService.getPointValues();
      
      expect(pointValues.TASK_COMPLETION).toBe(10);
      expect(pointValues.MESSAGE_SENT).toBe(1);
      expect(pointValues.FILE_UPLOAD).toBe(5);
      expect(pointValues.IDEA_SUBMISSION).toBe(3);
      expect(pointValues.VOTE_GIVEN).toBe(1);
    });
  });

  describe('getAchievementDefinitions', () => {
    it('should return achievement definitions', () => {
      const achievements = gamificationService.getAchievementDefinitions();
      
      expect(achievements.FIRST_TASK).toBeDefined();
      expect(achievements.FIRST_TASK.name).toBe('Getting Started');
      expect(achievements.FIRST_TASK.description).toBe('Complete your first task');
      expect(achievements.FIRST_TASK.pointsAwarded).toBe(5);
      
      expect(achievements.TASK_MASTER).toBeDefined();
      expect(achievements.TASK_MASTER.name).toBe('Task Master');
      
      expect(achievements.COMMUNICATOR).toBeDefined();
      expect(achievements.COMMUNICATOR.name).toBe('Team Communicator');
      
      expect(achievements.FILE_SHARER).toBeDefined();
      expect(achievements.IDEA_GENERATOR).toBeDefined();
      expect(achievements.TEAM_PLAYER).toBeDefined();
      expect(achievements.HUNDRED_CLUB).toBeDefined();
      expect(achievements.FIVE_HUNDRED_CLUB).toBeDefined();
    });
  });

  describe('achievement conditions', () => {
    it('should correctly evaluate first task achievement condition', () => {
      const achievements = gamificationService.getAchievementDefinitions();
      const breakdown = { tasksCompleted: 1, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      
      expect(achievements.FIRST_TASK.condition(breakdown)).toBe(true);
      
      const noTasksBreakdown = { tasksCompleted: 0, messagesPosted: 5, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      expect(achievements.FIRST_TASK.condition(noTasksBreakdown)).toBe(false);
    });

    it('should correctly evaluate task master achievement condition', () => {
      const achievements = gamificationService.getAchievementDefinitions();
      const breakdown = { tasksCompleted: 10, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      
      expect(achievements.TASK_MASTER.condition(breakdown)).toBe(true);
      
      const insufficientBreakdown = { tasksCompleted: 9, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      expect(achievements.TASK_MASTER.condition(insufficientBreakdown)).toBe(false);
    });

    it('should correctly evaluate hundred club achievement condition', () => {
      const achievements = gamificationService.getAchievementDefinitions();
      const breakdown = { tasksCompleted: 5, messagesPosted: 0, filesUploaded: 0, ideasSubmitted: 0, votesGiven: 0 };
      
      expect(achievements.HUNDRED_CLUB.condition(breakdown, 100)).toBe(true);
      expect(achievements.HUNDRED_CLUB.condition(breakdown, 99)).toBe(false);
    });
  });
});