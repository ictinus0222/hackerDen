import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import AnnotationOverlay from '../AnnotationOverlay';
import { useAuth } from '@/hooks/useAuth';
import { userNameService } from '@/services/userNameService';
import fileService from '@/services/fileService';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/services/userNameService');
vi.mock('@/services/fileService');

// Mock Popover components
vi.mock('@/components/ui/popover', () => ({
  Popover: ({ children, open }) => open ? <div data-testid="popover">{children}</div> : null,
  PopoverContent: ({ children }) => <div data-testid="popover-content">{children}</div>,
  PopoverTrigger: ({ children }) => <div data-testid="popover-trigger">{children}</div>
}));

const mockUser = {
  $id: 'user123',
  name: 'Test User'
};

const mockFile = {
  $id: 'file123',
  fileName: 'test-image.jpg',
  fileType: 'image/jpeg',
  storageId: 'storage123'
};

const mockAnnotations = [
  {
    $id: 'annotation1',
    fileId: 'file123',
    userId: 'user123',
    content: 'Test annotation',
    position: { x: 50, y: 50 },
    type: 'point',
    createdAt: '2024-01-01T12:00:00Z'
  }
];

describe('AnnotationOverlay', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    userNameService.getUserName.mockResolvedValue('Test User');
    fileService.getFileViewUrl.mockReturnValue('http://example.com/image.jpg');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Image Files', () => {
    it('renders image with annotation markers', async () => {
      render(
        <AnnotationOverlay
          file={mockFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      // Check image is rendered
      const image = screen.getByAltText('test-image.jpg');
      expect(image).toBeInTheDocument();
      expect(image).toHaveClass('cursor-crosshair');

      // Check instructions are rendered
      expect(screen.getByText('Click on the image to add an annotation')).toBeInTheDocument();
    });

    it('handles click to add new annotation', async () => {
      const onAnnotationAdd = vi.fn();
      
      render(
        <AnnotationOverlay
          file={mockFile}
          annotations={[]}
          onAnnotationAdd={onAnnotationAdd}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      const image = screen.getByAltText('test-image.jpg');
      
      // Mock getBoundingClientRect
      image.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      }));

      // Click on image
      fireEvent.click(image, { clientX: 50, clientY: 50 });

      // Should show new annotation form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add your comment...')).toBeInTheDocument();
      });
    });

    it('saves new annotation when form is submitted', async () => {
      const onAnnotationAdd = vi.fn();
      
      render(
        <AnnotationOverlay
          file={mockFile}
          annotations={[]}
          onAnnotationAdd={onAnnotationAdd}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      const image = screen.getByAltText('test-image.jpg');
      image.getBoundingClientRect = vi.fn(() => ({
        left: 0,
        top: 0,
        width: 100,
        height: 100
      }));

      // Click to add annotation
      fireEvent.click(image, { clientX: 50, clientY: 50 });

      // Fill in comment
      const textarea = await screen.findByPlaceholderText('Add your comment...');
      fireEvent.change(textarea, { target: { value: 'New annotation' } });

      // Click Add button
      const addButton = screen.getByText('Add');
      fireEvent.click(addButton);

      // Should call onAnnotationAdd with correct data
      await waitFor(() => {
        expect(onAnnotationAdd).toHaveBeenCalledWith({
          content: 'New annotation',
          position: { x: 50, y: 50 },
          type: 'point'
        });
      });
    });

    it('shows read-only mode correctly', () => {
      render(
        <AnnotationOverlay
          file={mockFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
          isReadOnly={true}
        />
      );

      const image = screen.getByAltText('test-image.jpg');
      expect(image).toBeInTheDocument();
      expect(screen.queryByText('Click on the image to add an annotation')).not.toBeInTheDocument();
    });
  });

  describe('Non-Image Files', () => {
    const textFile = {
      ...mockFile,
      fileName: 'test.txt',
      fileType: 'text/plain'
    };

    it('renders annotations as a list for non-image files', async () => {
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      // Should show annotations header
      expect(screen.getByText('Annotations (1)')).toBeInTheDocument();
      
      // Should show annotation content
      await waitFor(() => {
        expect(screen.getByText('Test annotation')).toBeInTheDocument();
      });

      // Should show Add Comment button
      expect(screen.getByText('Add Comment')).toBeInTheDocument();
    });

    it('shows add comment form for non-image files', async () => {
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={[]}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      // Click Add Comment button
      fireEvent.click(screen.getByText('Add Comment'));

      // Should show comment form
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Add your comment...')).toBeInTheDocument();
      });
    });

    it('handles annotation editing', async () => {
      const onAnnotationUpdate = vi.fn();
      
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={onAnnotationUpdate}
          onAnnotationDelete={vi.fn()}
        />
      );

      // Wait for user name to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Click edit button
      const editButton = screen.getByLabelText('Edit annotation');
      fireEvent.click(editButton);

      // Should show edit form
      const textarea = await screen.findByDisplayValue('Test annotation');
      fireEvent.change(textarea, { target: { value: 'Updated annotation' } });

      // Click Save button
      const saveButton = screen.getByText('Save');
      fireEvent.click(saveButton);

      // Should call onAnnotationUpdate
      await waitFor(() => {
        expect(onAnnotationUpdate).toHaveBeenCalledWith('annotation1', {
          content: 'Updated annotation'
        });
      });
    });

    it('handles annotation deletion', async () => {
      const onAnnotationDelete = vi.fn();
      
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={onAnnotationDelete}
        />
      );

      // Wait for user name to load
      await waitFor(() => {
        expect(screen.getByText('Test User')).toBeInTheDocument();
      });

      // Click delete button
      const deleteButton = screen.getByLabelText('Delete annotation');
      fireEvent.click(deleteButton);

      // Should call onAnnotationDelete
      expect(onAnnotationDelete).toHaveBeenCalledWith('annotation1');
    });

    it('shows empty state when no annotations', () => {
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={[]}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      expect(screen.getByText('No comments yet. Click "Add Comment" to start the discussion.')).toBeInTheDocument();
    });

    it('hides action buttons in read-only mode', () => {
      render(
        <AnnotationOverlay
          file={textFile}
          annotations={mockAnnotations}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
          isReadOnly={true}
        />
      );

      expect(screen.queryByText('Add Comment')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Edit annotation')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Delete annotation')).not.toBeInTheDocument();
    });
  });

  describe('User Permissions', () => {
    it('renders correctly with multiple annotations', async () => {
      const otherUserAnnotation = {
        ...mockAnnotations[0],
        $id: 'annotation2',
        userId: 'otheruser'
      };

      render(
        <AnnotationOverlay
          file={mockFile}
          annotations={[mockAnnotations[0], otherUserAnnotation]}
          onAnnotationAdd={vi.fn()}
          onAnnotationUpdate={vi.fn()}
          onAnnotationDelete={vi.fn()}
        />
      );

      // Check image is rendered
      const image = screen.getByAltText('test-image.jpg');
      expect(image).toBeInTheDocument();
      
      // Check instructions are rendered
      expect(screen.getByText('Click on the image to add an annotation')).toBeInTheDocument();
    });
  });
});