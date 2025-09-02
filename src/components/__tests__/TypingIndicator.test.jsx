import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TypingIndicator from '../TypingIndicator';

describe('TypingIndicator', () => {
  it('renders nothing when no users are typing', () => {
    const { container } = render(
      <TypingIndicator typingUsers={new Set()} currentUserId="user1" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders typing indicator when other users are typing', () => {
    const typingUsers = new Set(['user2', 'user3']);
    render(
      <TypingIndicator typingUsers={typingUsers} currentUserId="user1" />
    );
    
    expect(screen.getByText('2 people are typing...')).toBeInTheDocument();
  });

  it('excludes current user from typing indicator', () => {
    const typingUsers = new Set(['user1', 'user2']);
    render(
      <TypingIndicator typingUsers={typingUsers} currentUserId="user1" />
    );
    
    expect(screen.getByText('Someone is typing...')).toBeInTheDocument();
  });

  it('shows correct text for single typing user', () => {
    const typingUsers = new Set(['user2']);
    render(
      <TypingIndicator typingUsers={typingUsers} currentUserId="user1" />
    );
    
    expect(screen.getByText('Someone is typing...')).toBeInTheDocument();
  });

  it('shows correct text for multiple typing users', () => {
    const typingUsers = new Set(['user2', 'user3', 'user4']);
    render(
      <TypingIndicator typingUsers={typingUsers} currentUserId="user1" />
    );
    
    expect(screen.getByText('3 people are typing...')).toBeInTheDocument();
  });
});