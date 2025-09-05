/**
 * @fileoverview Tests for Celebration Effects Components
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ConfettiEffect, TaskCompletionCelebration, useCelebration } from '../CelebrationEffects';

describe('Celebration Effects', () => {
  it('renders confetti effect when active', () => {
    render(<ConfettiEffect isActive={true} particleCount={10} />);
    
    // Should render the confetti container
    expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument();
  });

  it('does not render confetti when inactive', () => {
    render(<ConfettiEffect isActive={false} />);
    
    // Should not render confetti container
    expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument();
  });

  it('renders task completion celebration', () => {
    const onComplete = vi.fn();
    render(<TaskCompletionCelebration isTriggered={true} onComplete={onComplete} />);
    
    // Should render the celebration effect
    expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument();
  });
});

describe('useCelebration hook', () => {
  it('provides celebration trigger functions', () => {
    const TestComponent = () => {
      const { triggerTaskCompletion, triggerAchievement, activeEffects } = useCelebration();
      
      return (
        <div>
          <button onClick={triggerTaskCompletion}>Trigger Task</button>
          <button onClick={triggerAchievement}>Trigger Achievement</button>
          <div data-testid="confetti-active">{activeEffects.confetti.toString()}</div>
        </div>
      );
    };

    render(<TestComponent />);
    
    expect(screen.getByText('Trigger Task')).toBeInTheDocument();
    expect(screen.getByText('Trigger Achievement')).toBeInTheDocument();
    expect(screen.getByTestId('confetti-active')).toHaveTextContent('false');
  });
});