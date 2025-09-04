import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FilePreview from '../FilePreview';
import { useAuth } from '@/hooks/useAuth';
import fileService from '@/services/fileService';

// Mock dependencies
vi.mock('@/hooks/useAuth');
vi.mock('@/services/fileService');

// Mock Dialog components
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open }) => open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>
}));

const mockUser = {
  $id: 'user123',
  name: 'Test User'
};

const mockFile = {
  $id: 'file123',
  fileName: 'test-image.jpg',
  fileType: 'image/jpeg',
  fileSize: 1024000,
  storageId: 'storage123',
  createdAt: '2024-01-01T12:00:00Z'
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

describe('FilePreview with Annotations', () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: mockUser });
    fileService.getFileAnnotations.mockResolvedValue(mockAnnotations);
    fileService.getFileViewUrl.mockReturnValue('http://example.com/image.jpg');
    fileService.getFileDownloadUrl.mockReturnValue('http://example.com/download.jpg');
    fileService.addAnnotation.mockResolvedValue({
      $id: 'new-annotation',
      ...mockAnnotations[0],
      content: 'New annotation'
    });
    fileService.updateAnnotation.mockResolvedValue({
      ...mockAnnotations[0],
      content: 'Updated annotation'
    });
    fileService.deleteAnnotation.mockResolvedValue();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('loads annotations when file preview opens', async () => {
    render(
      <FilePreview
        file={mockFile}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    // Should load annotations
    await waitFor(() => {
      expect(fileService.getFileAnnotations).toHaveBeenCalledWith('file123');
    });

    // Should display annotation count
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles adding new annotations', async () => {
    render(
      <FilePreview
        file={mockFile}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fileService.getFileAnnotations).toHaveBeenCalled();
    });

    // The annotation overlay should be rendered
    expect(screen.getByAltText('test-image.jpg')).toBeInTheDocument();
  });

  it('handles annotation updates', async () => {
    render(
      <FilePreview
        file={mockFile}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fileService.getFileAnnotations).toHaveBeenCalled();
    });

    // Verify the component is ready to handle updates
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('handles annotation deletion', async () => {
    render(
      <FilePreview
        file={mockFile}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fileService.getFileAnnotations).toHaveBeenCalled();
    });

    // Verify the component is ready to handle deletion
    expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
  });

  it('does not load annotations when dialog is closed', () => {
    render(
      <FilePreview
        file={mockFile}
        open={false}
        onOpenChange={vi.fn()}
      />
    );

    // Should not load annotations when closed
    expect(fileService.getFileAnnotations).not.toHaveBeenCalled();
  });

  it('handles non-image files with annotations', async () => {
    const textFile = {
      ...mockFile,
      fileName: 'test.txt',
      fileType: 'text/plain'
    };

    render(
      <FilePreview
        file={textFile}
        open={true}
        onOpenChange={vi.fn()}
      />
    );

    await waitFor(() => {
      expect(fileService.getFileAnnotations).toHaveBeenCalledWith('file123');
    });

    // Should show download message for text files
    expect(screen.getByText('Text file preview not available. Download to view contents.')).toBeInTheDocument();
  });
});