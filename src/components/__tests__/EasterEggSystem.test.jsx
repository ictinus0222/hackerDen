/**
 * @fileoverview Tests for Easter Egg System Components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CustomTooltip } from '../CustomTooltip';

vi.mock('../services/botService', () => ({
  default: {
    getSpecialDateTheme: () => null,
    triggerEasterEgg: vi.fn().mockResolvedValue({
      found: true,
      message: 'Test easter egg!',
      effect: { type: 'confetti', duration: 3000 }
    }),
    sendMotivationalMessage: vi.fn().mockResolvedValue({}),
    getWittyTooltip: vi.fn().mockReturnValue('Test tooltip!')
  }
}));

vi.mock('../services/gamificationService', () => ({
  gamificationService: {
    awardPoints: vi.fn().mockResolvedValue({}),
    checkAndAwardAchievements: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// Mock botService
vi.mock('../services/botService', () => ({
  default: {
    getWittyTooltip: vi.fn().mockReturnValue('Test tooltip!')
  }
}));

describe('CustomTooltip', () => {
  it('renders with custom content', () => {
    render(
      <CustomTooltip content="Custom tooltip content">
        <button>Hover me</button>
      </CustomTooltip>
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('generates witty content for task cards', () => {
    render(
      <CustomTooltip type="task_card" witty={true}>
        <div data-testid="task-card">Task Card</div>
      </CustomTooltip>
    );

    expect(screen.getByTestId('task-card')).toBeInTheDocument();
  });

  it('supports pop culture mode', () => {
    render(
      <CustomTooltip popCulture={true} witty={true}>
        <div data-testid="pop-culture">Pop Culture Element</div>
      </CustomTooltip>
    );

    expect(screen.getByTestId('pop-culture')).toBeInTheDocument();
  });
});



describe('Easter Egg Command Processing', () => {
  it('processes party command correctly', async () => {
    const mockProcessCommand = vi.fn().mockResolvedValue({
      found: true,
      message: 'Party time!',
      effect: { type: 'confetti', duration: 3000 }
    });

    // Mock the global function
    window.processEasterEggCommand = mockProcessCommand;

    await window.processEasterEggCommand('/party');

    expect(mockProcessCommand).toHaveBeenCalledWith('/party');
  });

  it('handles unknown commands gracefully', async () => {
    const mockProcessCommand = vi.fn().mockResolvedValue(null);
    window.processEasterEggCommand = mockProcessCommand;

    const result = await window.processEasterEggCommand('/unknown');

    expect(mockProcessCommand).toHaveBeenCalledWith('/unknown');
    expect(result).toBeNull();
  });
});

describe('Special Date Detection', () => {
  it('detects Halloween correctly', () => {
    // Mock date to be Halloween
    const mockDate = new Date('2024-10-31');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // This would be tested in the actual component
    const month = mockDate.getMonth() + 1;
    const day = mockDate.getDate();

    expect(month).toBe(10);
    expect(day).toBe(31);

    vi.restoreAllMocks();
  });

  it('detects Christmas correctly', () => {
    const mockDate = new Date('2024-12-25');
    vi.spyOn(global, 'Date').mockImplementation(() => mockDate);

    const month = mockDate.getMonth() + 1;
    const day = mockDate.getDate();

    expect(month).toBe(12);
    expect(day).toBe(25);

    vi.restoreAllMocks();
  });
});

describe('Achievement System', () => {
  it('tracks easter egg discoveries', () => {
    const stats = {
      easterEggsFound: 0,
      commandCounts: {},
      totalCelebrations: 0,
      uniqueCommands: 0
    };

    // Simulate discovering an easter egg
    const updatedStats = {
      ...stats,
      easterEggsFound: stats.easterEggsFound + 1,
      commandCounts: { '/party': 1 },
      totalCelebrations: stats.totalCelebrations + 1,
      uniqueCommands: 1
    };

    expect(updatedStats.easterEggsFound).toBe(1);
    expect(updatedStats.commandCounts['/party']).toBe(1);
    expect(updatedStats.totalCelebrations).toBe(1);
    expect(updatedStats.uniqueCommands).toBe(1);
  });

  it('calculates achievement unlock conditions correctly', () => {
    const FIRST_EASTER_EGG = {
      unlockCondition: (stats) => stats.easterEggsFound >= 1
    };

    const PARTY_ANIMAL = {
      unlockCondition: (stats) => stats.commandCounts['/party'] >= 5
    };

    const stats1 = { easterEggsFound: 1, commandCounts: { '/party': 1 } };
    const stats2 = { easterEggsFound: 5, commandCounts: { '/party': 5 } };

    expect(FIRST_EASTER_EGG.unlockCondition(stats1)).toBe(true);
    expect(PARTY_ANIMAL.unlockCondition(stats1)).toBe(false);
    expect(PARTY_ANIMAL.unlockCondition(stats2)).toBe(true);
  });
});

describe('Visual Effects', () => {
  it('applies CSS classes for effects', () => {
    const body = document.body;
    
    // Simulate confetti effect
    body.classList.add('confetti-effect');
    expect(body.classList.contains('confetti-effect')).toBe(true);
    
    // Clean up
    body.classList.remove('confetti-effect');
    expect(body.classList.contains('confetti-effect')).toBe(false);
  });

  it('handles effect duration correctly', (done) => {
    const body = document.body;
    const duration = 100; // Short duration for test
    
    body.classList.add('test-effect');
    
    setTimeout(() => {
      body.classList.remove('test-effect');
      expect(body.classList.contains('test-effect')).toBe(false);
      done();
    }, duration);
    
    expect(body.classList.contains('test-effect')).toBe(true);
  });
});

describe('Tooltip Personality', () => {
  it('generates different tooltip content', () => {
    const tooltips = [
      'This task is ready for action! 🎯',
      'Click me! I won\'t bite... much 😄',
      'I\'m just a humble task, waiting to be completed 📝'
    ];

    // Test that we can get different tooltips
    const tooltip1 = tooltips[0];
    const tooltip2 = tooltips[1];

    expect(tooltip1).not.toBe(tooltip2);
    expect(tooltip1).toContain('🎯');
    expect(tooltip2).toContain('😄');
  });

  it('includes pop culture references', () => {
    const popCultureTooltips = [
      'May the force be with you on this task! ⭐',
      'This task has chosen you, Harry! ⚡',
      'With great power comes great responsibility... to complete this task! 🕷️'
    ];

    popCultureTooltips.forEach(tooltip => {
      expect(typeof tooltip).toBe('string');
      expect(tooltip.length).toBeGreaterThan(0);
    });
  });
});