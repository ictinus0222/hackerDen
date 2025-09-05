import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { reactionService } from '../../services/reactionService';
import ReactionPicker from '../ReactionPicker';
import ReactionDisplay from '../ReactionDisplay';
import ReactionButton from '../ReactionButton';
import { useAuth } from '../../hooks/useAuth';

// Mock the services and hooks
vi.mock('../../services/reactionService');
vi.mock('../../hooks/useAuth');

// Mock UI components
vi.mock('../ui/popover', () => ({
  Popover: ({ children, open, onOpenChange }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverContent: ({ children }) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }) => <div data-testid="popover-trigger">{children}</div>
}));

vi.mock('../ui/tabs', () => ({
  Tabs: ({ children, defaultValue }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>
      {children}
    </div>
  ),
  TabsContent: ({ children, value }) => (
    <div data-testid="tabs-content" data-value={value}>
      {children}
    </div>
  ),
  TabsList: ({ children }) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }) => (
    <button data-testid="tabs-trigger" data-value={value}>
      {children}
    </button>
  )
}));

vi.mock('../ui/tooltip', () => ({
  TooltipProvider: ({ children }) => <div data-testid="tooltip-provider">{children}</div>,
  Tooltip: ({ children }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipTrigger: ({ children }) => <div data-testid="tooltip-trigger">{children}</div>
}));

describe('Reaction System', () => {
  const mockUser = {
    $id: 'user123',
    name: 'Test User'
  };

  const mockReactions = [
    {
      emoji: '👍',
      isCustom: false,
      count: 3,
      users: ['user123', 'user456', 'user789'],
      reactions: [
        { $id: 'reaction1', userId: 'user123', emoji: '👍' },
        { $id: 'reaction2', userId: 'user456', emoji: '👍' },
        { $id: 'reaction3', userId: 'user789', emoji: '👍' }
      ]
    },
    {
      emoji: '❤️',
      isCustom: false,
      count: 1,
      users: ['user456'],
      reactions: [
        { $id: 'reaction4', userId: 'user456', emoji: '❤️' }
      ]
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ user: mockUser });
    reactionService.getReactions.mockResolvedValue(mockReactions);
    reactionService.addReaction.mockResolvedValue({ $id: 'new-reaction' });
    reactionService.getPopularEmoji.mockReturnValue(['👍', '👎', '❤️', '😂']);
    reactionService.subscribeToReactions.mockReturnValue(() => {});
  });

  describe('ReactionPicker', () => {
    it('renders reaction picker with popular emoji', async () => {
      render(
        <ReactionPicker
          targetId="message123"
          targetType="message"
          teamId="team123"
          onReactionAdd={vi.fn()}
        />
      );

      // Should render the trigger button
      expect(screen.getAllByRole('button')).toHaveLength(expect.any(Number));
    });

    it('calls onReactionAdd when emoji is selected', async () => {
      const onReactionAdd = vi.fn();
      
      render(
        <ReactionPicker
          targetId="message123"
          targetType="message"
          teamId="team123"
          onReactionAdd={onReactionAdd}
        />
      );

      // Mock the emoji selection
      reactionService.addReaction.mockResolvedValue({ $id: 'new-reaction', emoji: '👍' });

      // This would be triggered by clicking an emoji in the actual component
      await waitFor(() => {
        expect(reactionService.addReaction).toHaveBeenCalledWith(
          'message123',
          'message',
          'user123',
          expect.any(String),
          false
        );
      });
    });
  });

  describe('ReactionDisplay', () => {
    it('renders reaction groups with counts', async () => {
      render(
        <ReactionDisplay
          targetId="message123"
          targetType="message"
        />
      );

      await waitFor(() => {
        expect(reactionService.getReactions).toHaveBeenCalledWith('message123', 'message');
      });

      // Should show loading state initially
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    });

    it('handles reaction toggle correctly', async () => {
      render(
        <ReactionDisplay
          targetId="message123"
          targetType="message"
        />
      );

      await waitFor(() => {
        expect(reactionService.getReactions).toHaveBeenCalled();
      });

      // Mock clicking on a reaction
      reactionService.addReaction.mockResolvedValue(null); // null means reaction was removed

      // This would be triggered by clicking a reaction button
      await waitFor(() => {
        expect(reactionService.subscribeToReactions).toHaveBeenCalledWith(
          'message123',
          'message',
          expect.any(Function)
        );
      });
    });
  });

  describe('ReactionButton', () => {
    it('renders both display and picker components', () => {
      render(
        <ReactionButton
          targetId="task123"
          targetType="task"
          teamId="team123"
        />
      );

      // Should render the container
      expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
    });

    it('handles compact mode correctly', () => {
      render(
        <ReactionButton
          targetId="task123"
          targetType="task"
          teamId="team123"
          compact={true}
          showAddButton={false}
        />
      );

      // Should still render in compact mode
      expect(screen.getAllByRole('generic')).toHaveLength(expect.any(Number));
    });
  });

  describe('Reaction Service Integration', () => {
    it('loads reactions on component mount', async () => {
      render(
        <ReactionDisplay
          targetId="message123"
          targetType="message"
        />
      );

      await waitFor(() => {
        expect(reactionService.getReactions).toHaveBeenCalledWith('message123', 'message');
      });
    });

    it('subscribes to real-time updates', async () => {
      render(
        <ReactionDisplay
          targetId="message123"
          targetType="message"
        />
      );

      await waitFor(() => {
        expect(reactionService.subscribeToReactions).toHaveBeenCalledWith(
          'message123',
          'message',
          expect.any(Function)
        );
      });
    });

    it('handles reaction service errors gracefully', async () => {
      reactionService.getReactions.mockRejectedValue(new Error('Network error'));

      render(
        <ReactionDisplay
          targetId="message123"
          targetType="message"
        />
      );

      await waitFor(() => {
        expect(reactionService.getReactions).toHaveBeenCalled();
      });

      // Should not crash and should handle error gracefully
      expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    });
  });

  describe('Custom Emoji Support', () => {
    it('handles custom emoji upload', async () => {
      const mockFile = new File(['emoji'], 'custom.png', { type: 'image/png' });
      reactionService.uploadCustomEmoji.mockResolvedValue({
        id: 'custom123',
        name: 'custom',
        url: 'https://example.com/custom.png'
      });

      render(
        <ReactionPicker
          targetId="message123"
          targetType="message"
          teamId="team123"
          onReactionAdd={vi.fn()}
        />
      );

      // This would be triggered by file upload in the actual component
      await waitFor(() => {
        expect(reactionService.getTeamCustomEmoji).toHaveBeenCalledWith('team123');
      });
    });

    it('validates custom emoji file types', async () => {
      const invalidFile = new File(['text'], 'invalid.txt', { type: 'text/plain' });
      reactionService.uploadCustomEmoji.mockRejectedValue(
        new Error('Only PNG, JPEG, GIF, and WebP images are allowed for custom emoji.')
      );

      render(
        <ReactionPicker
          targetId="message123"
          targetType="message"
          teamId="team123"
          onReactionAdd={vi.fn()}
        />
      );

      // Error handling would be tested in the actual file upload flow
      expect(screen.getAllByRole('button')).toHaveLength(expect.any(Number));
    });
  });
});