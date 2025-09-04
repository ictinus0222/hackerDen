import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import IdeaModal from '../IdeaModal';

// Mock the hooks and services
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      $id: 'user-123',
      name: 'Test User',
    },
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({
      hackathonId: 'hackathon-123',
    }),
  };
});

vi.mock('../../services/ideaService', () => ({
  ideaService: {
    createIdea: vi.fn(),
  },
}));

vi.mock('../../services/teamService', () => ({
  teamService: {
    getUserTeamForHackathon: vi.fn(),
  },
}));

const renderIdeaModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onIdeaCreated: vi.fn(),
    editIdea: null,
    ...props,
  };

  return render(
    <BrowserRouter>
      <IdeaModal {...defaultProps} />
    </BrowserRouter>
  );
};

describe('IdeaModal', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock team service to return a team
    const { teamService } = await import('../../services/teamService');
    vi.mocked(teamService).getUserTeamForHackathon.mockResolvedValue({
      $id: 'team-123',
      name: 'Test Team',
      userRole: 'member',
    });
  });

  it('should render the modal when open', async () => {
    renderIdeaModal();

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    expect(screen.getByPlaceholderText("What's your brilliant idea?")).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe your idea in detail. What problem does it solve? How would it work?')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    renderIdeaModal({ isOpen: false });

    expect(screen.queryByText('Submit New Idea')).not.toBeInTheDocument();
  });

  it('should show validation errors for required fields', async () => {
    const onClose = vi.fn();
    renderIdeaModal({ onClose });

    // Try to submit without filling required fields
    const submitButton = screen.getByText('Submit Idea');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Idea title is required')).toBeInTheDocument();
      expect(screen.getByText('Idea description is required')).toBeInTheDocument();
    });

    // Modal should not close
    expect(onClose).not.toHaveBeenCalled();
  });

  it('should add and remove tags', async () => {
    renderIdeaModal();

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    const tagInput = screen.getByPlaceholderText('Add a tag (e.g., frontend, AI, mobile)...');
    const addButton = screen.getByText('Add');

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'frontend' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('frontend')).toBeInTheDocument();
    });

    // Add another tag
    fireEvent.change(tagInput, { target: { value: 'react' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
    });

    // Remove a tag
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      expect(screen.queryByText('frontend')).not.toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
    });
  });

  it('should add tag on Enter key press', async () => {
    renderIdeaModal();

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    const tagInput = screen.getByPlaceholderText('Add a tag (e.g., frontend, AI, mobile)...');

    // Add a tag using Enter key
    fireEvent.change(tagInput, { target: { value: 'backend' } });
    fireEvent.keyDown(tagInput, { key: 'Enter', code: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('backend')).toBeInTheDocument();
    });

    // Input should be cleared
    expect(tagInput.value).toBe('');
  });

  it('should not add duplicate tags', async () => {
    renderIdeaModal();

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    const tagInput = screen.getByPlaceholderText('Add a tag (e.g., frontend, AI, mobile)...');
    const addButton = screen.getByText('Add');

    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'frontend' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('frontend')).toBeInTheDocument();
    });

    // Try to add the same tag again
    fireEvent.change(tagInput, { target: { value: 'frontend' } });
    fireEvent.click(addButton);

    // Should still only have one instance
    const frontendTags = screen.getAllByText('frontend');
    expect(frontendTags).toHaveLength(1);
  });

  it('should submit idea successfully', async () => {
    const { ideaService } = await import('../../services/ideaService');
    vi.mocked(ideaService).createIdea.mockResolvedValue({
      $id: 'idea-123',
      title: 'Test Idea',
      description: 'Test Description',
      tags: ['frontend'],
    });
    const onIdeaCreated = vi.fn();
    const onClose = vi.fn();



    renderIdeaModal({ onIdeaCreated, onClose });

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    // Fill in the form
    const titleInput = screen.getByPlaceholderText("What's your brilliant idea?");
    const descriptionInput = screen.getByPlaceholderText('Describe your idea in detail. What problem does it solve? How would it work?');
    const tagInput = screen.getByPlaceholderText('Add a tag (e.g., frontend, AI, mobile)...');
    const addTagButton = screen.getByText('Add');

    fireEvent.change(titleInput, { target: { value: 'Test Idea' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    
    // Add a tag
    fireEvent.change(tagInput, { target: { value: 'frontend' } });
    fireEvent.click(addTagButton);

    await waitFor(() => {
      expect(screen.getByText('frontend')).toBeInTheDocument();
    });

    // Submit the form
    const submitButton = screen.getByText('Submit Idea');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(vi.mocked(ideaService).createIdea).toHaveBeenCalledWith(
        'team-123',
        'hackathon-123',
        {
          title: 'Test Idea',
          description: 'Test Description',
          tags: ['frontend'],
          createdBy: 'user-123',
        },
        'Test User'
      );
    });

    expect(onIdeaCreated).toHaveBeenCalledWith({
      $id: 'idea-123',
      title: 'Test Idea',
      description: 'Test Description',
      tags: ['frontend'],
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('should handle submission errors', async () => {
    const { ideaService } = await import('../../services/ideaService');
    const onIdeaCreated = vi.fn();
    const onClose = vi.fn();

    vi.mocked(ideaService).createIdea.mockRejectedValue(new Error('Failed to create idea'));

    renderIdeaModal({ onIdeaCreated, onClose });

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    // Fill in the form
    const titleInput = screen.getByPlaceholderText("What's your brilliant idea?");
    const descriptionInput = screen.getByPlaceholderText('Describe your idea in detail. What problem does it solve? How would it work?');

    fireEvent.change(titleInput, { target: { value: 'Test Idea' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    // Submit the form
    const submitButton = screen.getByText('Submit Idea');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create idea')).toBeInTheDocument();
    });

    // Modal should not close on error
    expect(onClose).not.toHaveBeenCalled();
    expect(onIdeaCreated).not.toHaveBeenCalled();
  });

  it('should close modal when cancel is clicked', async () => {
    const onClose = vi.fn();
    renderIdeaModal({ onClose });

    await waitFor(() => {
      expect(screen.getByText('Submit New Idea')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalled();
  });

  it('should show edit mode when editIdea is provided', async () => {
    const editIdea = {
      $id: 'idea-123',
      title: 'Existing Idea',
      description: 'Existing Description',
      tags: ['existing-tag'],
    };

    renderIdeaModal({ editIdea });

    await waitFor(() => {
      expect(screen.getByText('Edit Idea')).toBeInTheDocument();
    });

    // Form should be populated with existing data
    expect(screen.getByDisplayValue('Existing Idea')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
    expect(screen.getByText('existing-tag')).toBeInTheDocument();
  });
});