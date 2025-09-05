/**
 * @fileoverview Mobile Responsiveness and Touch Interaction Tests for Enhancement Features
 * Tests mobile optimization and touch interactions for all enhancement components
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';

// Import enhancement components
import FileUpload from '../components/FileUpload';
import FileLibrary from '../components/FileLibrary';
import IdeaBoard from '../components/IdeaBoard';
import IdeaCard from '../components/IdeaCard';
import PollDisplay from '../components/PollDisplay';
import PollCreator from '../components/PollCreator';
import Leaderboard from '../components/Leaderboard';
import ReactionPicker from '../components/ReactionPicker';
import { ConfettiEffect } from '../components/CelebrationEffects';
import SubmissionBuilder from '../components/SubmissionBuilder';
import SubmissionPreview from '../components/SubmissionPreview';

// Mock hooks
vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { $id: 'user1', name: 'Test User' },
    logout: vi.fn()
  })
}));

vi.mock('../hooks/useTeam', () => ({
  useTeam: () => ({
    team: { $id: 'team1', name: 'Test Team', userRole: 'owner' }
  })
}));

// Mock services
vi.mock('../services/fileService', () => ({
  fileService: {
    uploadFile: vi.fn().mockResolvedValue({ $id: 'file1', fileName: 'test.jpg' }),
    getTeamFiles: vi.fn().mockResolvedValue([]),
    deleteFile: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../services/ideaService', () => ({
  ideaService: {
    createIdea: vi.fn().mockResolvedValue({ $id: 'idea1' }),
    voteOnIdea: vi.fn().mockResolvedValue({ $id: 'vote1' }),
    getTeamIdeas: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../services/pollService', () => ({
  default: {
    createPoll: vi.fn().mockResolvedValue({ $id: 'poll1' }),
    voteOnPoll: vi.fn().mockResolvedValue({ $id: 'vote1' }),
    getActivePolls: vi.fn().mockResolvedValue([])
  }
}));

vi.mock('../services/reactionService', () => ({
  reactionService: {
    getPopularEmoji: vi.fn().mockReturnValue(['👍', '❤️', '😂', '🎉', '🔥']),
    getTeamCustomEmoji: vi.fn().mockResolvedValue([]),
    addReaction: vi.fn().mockResolvedValue({ id: 'reaction1' })
  }
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Enhancement Mobile Responsiveness Tests', () => {
  beforeEach(() => {
    // Set mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone SE width
    });
    
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone SE height
    });

    // Mock touch support
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      configurable: true,
      value: null,
    });
  });

  describe('File Upload Mobile Optimization', () => {
    it('should have camera capture functionality on mobile', () => {
      render(<FileUpload onFileUpload={vi.fn()} teamId="team1" />);

      const cameraButton = screen.getByText('Take Photo');
      expect(cameraButton).toBeInTheDocument();
      expect(cameraButton).toHaveClass('min-h-[44px]'); // iOS touch target size
      expect(cameraButton).toHaveClass('touch-manipulation');
      expect(cameraButton).toHaveClass('sm:hidden'); // Only visible on mobile
    });

    it('should have touch-friendly file selection buttons', () => {
      render(<FileUpload onFileUpload={vi.fn()} teamId="team1" />);

      const chooseFilesButton = screen.getByText('Choose Files');
      expect(chooseFilesButton).toHaveClass('min-h-[44px]');
      expect(chooseFilesButton).toHaveClass('touch-manipulation');
      expect(chooseFilesButton).toHaveClass('active:scale-95'); // Touch feedback
    });

    it('should handle drag and drop on mobile with touch events', async () => {
      const mockOnFileUpload = vi.fn();
      render(<FileUpload onFileUpload={mockOnFileUpload} teamId="team1" />);

      const dropZone = screen.getByText(/drag.*drop/i).closest('div');
      
      // Simulate touch drag and drop
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      
      fireEvent.touchStart(dropZone, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [file]
        }
      });

      expect(mockOnFileUpload).toHaveBeenCalledWith([file]);
    });

    it('should show mobile-optimized progress indicators', async () => {
      const mockOnFileUpload = vi.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 1000))
      );
      
      render(<FileUpload onFileUpload={mockOnFileUpload} teamId="team1" />);

      const input = screen.getByLabelText(/choose files/i);
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await userEvent.upload(input, file);

      // Should show mobile-friendly progress bar
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveClass('h-2'); // Thicker on mobile
      expect(progressBar).toHaveClass('rounded-full');
    });
  });

  describe('File Library Mobile Optimization', () => {
    it('should use grid layout optimized for mobile screens', () => {
      const mockFiles = [
        { $id: 'file1', fileName: 'test1.jpg', fileType: 'image/jpeg', fileSize: 1024 },
        { $id: 'file2', fileName: 'test2.pdf', fileType: 'application/pdf', fileSize: 2048 }
      ];

      render(<FileLibrary files={mockFiles} onFileSelect={vi.fn()} />);

      const grid = screen.getByRole('grid');
      expect(grid).toHaveClass('grid-cols-1'); // Single column on mobile
      expect(grid).toHaveClass('sm:grid-cols-2'); // Two columns on larger screens
      expect(grid).toHaveClass('gap-3'); // Appropriate spacing for touch
    });

    it('should have touch-friendly file action buttons', () => {
      const mockFiles = [
        { $id: 'file1', fileName: 'test.jpg', fileType: 'image/jpeg', fileSize: 1024 }
      ];

      render(<FileLibrary files={mockFiles} onFileSelect={vi.fn()} />);

      const actionButton = screen.getByRole('button', { name: /more options/i });
      expect(actionButton).toHaveClass('min-h-[44px]');
      expect(actionButton).toHaveClass('min-w-[44px]');
      expect(actionButton).toHaveClass('touch-manipulation');
    });
  });

  describe('Idea Board Mobile Optimization', () => {
    it('should have mobile-optimized idea card layout', () => {
      const mockIdeas = [
        {
          $id: 'idea1',
          title: 'Great Idea',
          description: 'This is a great idea',
          status: 'submitted',
          voteCount: 5,
          tags: ['frontend'],
          createdBy: 'user2',
          $createdAt: new Date().toISOString()
        }
      ];

      render(<IdeaBoard ideas={mockIdeas} onVote={vi.fn()} onStatusChange={vi.fn()} />);

      const ideaCards = screen.getAllByRole('article');
      ideaCards.forEach(card => {
        expect(card).toHaveClass('p-4'); // Adequate padding for touch
        expect(card).toHaveClass('rounded-lg'); // Rounded corners for mobile
      });
    });

    it('should have touch-friendly voting buttons', () => {
      const mockIdea = {
        $id: 'idea1',
        title: 'Test Idea',
        description: 'Test Description',
        status: 'submitted',
        voteCount: 5,
        tags: ['frontend'],
        createdBy: 'user2',
        $createdAt: new Date().toISOString()
      };

      render(
        <IdeaCard
          idea={mockIdea}
          hasUserVoted={false}
          onVote={vi.fn()}
          onStatusChange={vi.fn()}
          canChangeStatus={true}
          currentUser={{ $id: 'user1' }}
        />
      );

      const voteButton = screen.getByRole('button', { name: /vote/i });
      expect(voteButton).toHaveClass('min-h-[44px]');
      expect(voteButton).toHaveClass('min-w-[60px]');
      expect(voteButton).toHaveClass('touch-manipulation');
      expect(voteButton).toHaveClass('active:scale-95'); // Touch feedback
    });

    it('should handle swipe gestures for idea navigation', async () => {
      const mockIdeas = Array.from({ length: 10 }, (_, i) => ({
        $id: `idea${i}`,
        title: `Idea ${i}`,
        description: 'Test',
        status: 'submitted',
        voteCount: i,
        tags: [],
        createdBy: 'user1',
        $createdAt: new Date().toISOString()
      }));

      render(<IdeaBoard ideas={mockIdeas} onVote={vi.fn()} onStatusChange={vi.fn()} />);

      const container = screen.getByRole('main');
      
      // Simulate swipe left
      fireEvent.touchStart(container, {
        touches: [{ clientX: 200, clientY: 100 }]
      });

      fireEvent.touchMove(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 100, clientY: 100 }]
      });

      // Should handle swipe gesture (implementation depends on component)
      expect(container).toHaveClass('touch-pan-x');
    });
  });

  describe('Poll Display Mobile Optimization', () => {
    it('should have large touch-friendly voting options', () => {
      const mockPoll = {
        $id: 'poll1',
        question: 'Test Poll?',
        options: ['Option 1', 'Option 2', 'Option 3'],
        allowMultiple: false,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        totalVotes: 0
      };

      render(<PollDisplay poll={mockPoll} onVoteUpdate={vi.fn()} />);

      const options = screen.getAllByRole('radio');
      options.forEach(option => {
        const container = option.closest('label');
        expect(container).toHaveClass('min-h-[44px]');
        expect(container).toHaveClass('touch-manipulation');
        expect(container).toHaveClass('cursor-pointer');
      });
    });

    it('should have mobile-optimized submit button', () => {
      const mockPoll = {
        $id: 'poll1',
        question: 'Test Poll?',
        options: ['Option 1', 'Option 2'],
        allowMultiple: false,
        isActive: true,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        totalVotes: 0
      };

      render(<PollDisplay poll={mockPoll} onVoteUpdate={vi.fn()} />);

      const submitButton = screen.getByText('Submit Vote');
      expect(submitButton).toHaveClass('min-h-[48px]'); // Larger for primary action
      expect(submitButton).toHaveClass('touch-manipulation');
      expect(submitButton).toHaveClass('active:scale-95');
      expect(submitButton).toHaveClass('w-full'); // Full width on mobile
    });

    it('should show mobile-optimized poll results', () => {
      const mockPoll = {
        $id: 'poll1',
        question: 'Test Poll?',
        options: ['Option 1', 'Option 2'],
        isActive: false,
        results: [
          { option: 'Option 1', votes: 7, percentage: 70 },
          { option: 'Option 2', votes: 3, percentage: 30 }
        ],
        totalVotes: 10
      };

      render(<PollDisplay poll={mockPoll} onVoteUpdate={vi.fn()} />);

      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toHaveClass('h-6'); // Thicker progress bars for mobile
        expect(bar).toHaveClass('rounded-full');
      });
    });
  });

  describe('Poll Creator Mobile Optimization', () => {
    it('should have mobile-friendly form inputs', () => {
      render(<PollCreator onCreatePoll={vi.fn()} />);

      const questionInput = screen.getByLabelText(/question/i);
      expect(questionInput).toHaveClass('min-h-[44px]');
      expect(questionInput).toHaveClass('text-base'); // Prevent zoom on iOS

      const optionInputs = screen.getAllByLabelText(/option/i);
      optionInputs.forEach(input => {
        expect(input).toHaveClass('min-h-[44px]');
        expect(input).toHaveClass('text-base');
      });
    });

    it('should have touch-friendly add/remove option buttons', () => {
      render(<PollCreator onCreatePoll={vi.fn()} />);

      const addButton = screen.getByText(/add option/i);
      expect(addButton).toHaveClass('min-h-[44px]');
      expect(addButton).toHaveClass('touch-manipulation');
      expect(addButton).toHaveClass('active:scale-95');
    });
  });

  describe('Leaderboard Mobile Optimization', () => {
    it('should use mobile-optimized table layout', () => {
      const mockLeaderboard = [
        { userId: 'user1', userName: 'User 1', totalPoints: 100, rank: 1 },
        { userId: 'user2', userName: 'User 2', totalPoints: 80, rank: 2 }
      ];

      render(<Leaderboard leaderboard={mockLeaderboard} />);

      const table = screen.getByRole('table');
      expect(table).toHaveClass('w-full');
      
      const rows = screen.getAllByRole('row');
      rows.forEach(row => {
        expect(row).toHaveClass('min-h-[56px]'); // Adequate row height for touch
      });
    });

    it('should have mobile-friendly user avatars and badges', () => {
      const mockLeaderboard = [
        { 
          userId: 'user1', 
          userName: 'User 1', 
          totalPoints: 100, 
          rank: 1,
          achievements: ['task_master', 'collaborator']
        }
      ];

      render(<Leaderboard leaderboard={mockLeaderboard} />);

      const avatars = screen.getAllByRole('img');
      avatars.forEach(avatar => {
        expect(avatar).toHaveClass('w-8', 'h-8'); // Appropriate size for mobile
        expect(avatar).toHaveClass('rounded-full');
      });
    });
  });

  describe('Reaction Picker Mobile Optimization', () => {
    it('should have touch-friendly emoji buttons', () => {
      render(
        <ReactionPicker
          targetId="target1"
          targetType="message"
          teamId="team1"
        />
      );

      const triggerButton = screen.getByRole('button');
      expect(triggerButton).toHaveClass('min-h-[44px]');
      expect(triggerButton).toHaveClass('min-w-[44px]');
      expect(triggerButton).toHaveClass('touch-manipulation');
    });

    it('should show mobile-optimized emoji picker grid', async () => {
      render(
        <ReactionPicker
          targetId="target1"
          targetType="message"
          teamId="team1"
        />
      );

      const triggerButton = screen.getByRole('button');
      await userEvent.click(triggerButton);

      const emojiButtons = screen.getAllByRole('button', { name: /emoji/i });
      emojiButtons.forEach(button => {
        expect(button).toHaveClass('min-h-[44px]');
        expect(button).toHaveClass('min-w-[44px]');
        expect(button).toHaveClass('touch-manipulation');
        expect(button).toHaveClass('text-xl'); // Larger emoji for touch
      });
    });

    it('should support long-press for emoji picker', async () => {
      render(
        <ReactionPicker
          targetId="target1"
          targetType="message"
          teamId="team1"
        />
      );

      const triggerButton = screen.getByRole('button');
      
      // Simulate long press
      fireEvent.touchStart(triggerButton);
      
      await new Promise(resolve => setTimeout(resolve, 500)); // Long press duration
      
      fireEvent.touchEnd(triggerButton);

      // Should open emoji picker on long press
      const emojiPicker = screen.getByRole('dialog');
      expect(emojiPicker).toBeInTheDocument();
    });
  });

  describe('Celebration Effects Mobile Optimization', () => {
    it('should reduce particle count on mobile for performance', () => {
      const { rerender } = render(
        <ConfettiEffect 
          isActive={false}
          particleCount={100}
        />
      );

      rerender(
        <ConfettiEffect 
          isActive={true}
          particleCount={100}
        />
      );

      // On mobile, particle count should be automatically reduced
      const canvas = screen.getByRole('img', { hidden: true }); // Canvas with role img
      expect(canvas).toBeInTheDocument();
      
      // Verify mobile-optimized animation
      expect(canvas).toHaveClass('pointer-events-none');
    });

    it('should use CSS animations instead of complex effects on mobile', () => {
      render(
        <ConfettiEffect 
          isActive={true}
          particleCount={50}
          isMobile={true}
        />
      );

      const effect = screen.getByTestId('celebration-effect');
      expect(effect).toHaveClass('animate-bounce'); // Simple CSS animation
      expect(effect).not.toHaveClass('complex-particle-system');
    });
  });

  describe('Submission Pages Mobile Optimization', () => {
    it('should have mobile-optimized submission builder form', () => {
      render(<SubmissionBuilder onSubmit={vi.fn()} teamId="team1" />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveClass('min-h-[44px]');
        expect(input).toHaveClass('text-base'); // Prevent zoom on iOS
      });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      expect(submitButton).toHaveClass('min-h-[48px]');
      expect(submitButton).toHaveClass('w-full'); // Full width on mobile
      expect(submitButton).toHaveClass('touch-manipulation');
    });

    it('should have mobile-friendly submission preview layout', () => {
      const mockSubmission = {
        $id: 'submission1',
        title: 'Test Project',
        description: 'Test Description',
        techStack: ['React', 'Node.js'],
        teamName: 'Test Team',
        members: [
          { userId: 'user1', userName: 'User 1', role: 'owner' }
        ]
      };

      render(<SubmissionPreview submission={mockSubmission} />);

      const container = screen.getByRole('main');
      expect(container).toHaveClass('px-4'); // Mobile padding
      expect(container).toHaveClass('py-6'); // Adequate vertical spacing

      const sections = screen.getAllByRole('region');
      sections.forEach(section => {
        expect(section).toHaveClass('mb-6'); // Spacing between sections
      });
    });
  });

  describe('Touch Gesture Support', () => {
    it('should handle swipe gestures for navigation', async () => {
      const mockIdeas = Array.from({ length: 5 }, (_, i) => ({
        $id: `idea${i}`,
        title: `Idea ${i}`,
        description: 'Test',
        status: 'submitted',
        voteCount: 0,
        tags: [],
        createdBy: 'user1',
        $createdAt: new Date().toISOString()
      }));

      render(<IdeaBoard ideas={mockIdeas} onVote={vi.fn()} onStatusChange={vi.fn()} />);

      const container = screen.getByRole('main');
      
      // Simulate swipe right
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 100 }]
      });

      fireEvent.touchMove(container, {
        touches: [{ clientX: 200, clientY: 100 }]
      });

      fireEvent.touchEnd(container, {
        changedTouches: [{ clientX: 200, clientY: 100 }]
      });

      // Should handle swipe gesture
      expect(container).toHaveAttribute('data-swipe-direction', 'right');
    });

    it('should support pinch-to-zoom for images in file preview', async () => {
      const mockFile = {
        $id: 'file1',
        fileName: 'image.jpg',
        fileType: 'image/jpeg',
        previewUrl: 'https://example.com/image.jpg'
      };

      render(<FileLibrary files={[mockFile]} onFileSelect={vi.fn()} />);

      const fileCard = screen.getByText('image.jpg').closest('div');
      await userEvent.click(fileCard);

      const image = screen.getByRole('img');
      
      // Simulate pinch gesture
      fireEvent.touchStart(image, {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ]
      });

      fireEvent.touchMove(image, {
        touches: [
          { clientX: 80, clientY: 80 },
          { clientX: 220, clientY: 220 }
        ]
      });

      fireEvent.touchEnd(image);

      // Should support zoom
      expect(image).toHaveClass('touch-pinch-zoom');
    });

    it('should prevent text selection on interactive elements', () => {
      const mockIdea = {
        $id: 'idea1',
        title: 'Test Idea',
        description: 'Test Description',
        status: 'submitted',
        voteCount: 5,
        tags: ['frontend'],
        createdBy: 'user2',
        $createdAt: new Date().toISOString()
      };

      render(
        <IdeaCard
          idea={mockIdea}
          hasUserVoted={false}
          onVote={vi.fn()}
          onStatusChange={vi.fn()}
          canChangeStatus={true}
          currentUser={{ $id: 'user1' }}
        />
      );

      const card = screen.getByRole('article');
      expect(card).toHaveClass('select-none'); // Prevent text selection
      expect(card).toHaveClass('touch-manipulation');
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should have proper focus management for touch navigation', () => {
      render(<FileUpload onFileUpload={vi.fn()} teamId="team1" />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex');
        expect(button).toHaveClass('focus:outline-none');
        expect(button).toHaveClass('focus:ring-2');
        expect(button).toHaveClass('focus:ring-offset-2');
      });
    });

    it('should have appropriate ARIA labels for touch interactions', () => {
      render(
        <ReactionPicker
          targetId="target1"
          targetType="message"
          teamId="team1"
        />
      );

      const triggerButton = screen.getByRole('button');
      expect(triggerButton).toHaveAttribute('aria-label');
      expect(triggerButton).toHaveAttribute('aria-expanded');
    });

    it('should support screen reader navigation on mobile', () => {
      const mockLeaderboard = [
        { userId: 'user1', userName: 'User 1', totalPoints: 100, rank: 1 }
      ];

      render(<Leaderboard leaderboard={mockLeaderboard} />);

      const table = screen.getByRole('table');
      expect(table).toHaveAttribute('aria-label');
      
      const headers = screen.getAllByRole('columnheader');
      headers.forEach(header => {
        expect(header).toHaveAttribute('scope', 'col');
      });
    });
  });
});