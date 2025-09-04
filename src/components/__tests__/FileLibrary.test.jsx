import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import FileLibrary from '../FileLibrary';
import fileService from '@/services/fileService';

// Mock the file service
vi.mock('@/services/fileService', () => ({
  default: {
    getTeamFiles: vi.fn(),
    subscribeToFiles: vi.fn(),
    getFileDownloadUrl: vi.fn(),
    deleteFile: vi.fn()
  }
}));

// Mock the realtime service
vi.mock('@/services/realtimeService.js', () => ({
  realtimeService: {
    subscribe: vi.fn(() => () => {})
  }
}));

describe('FileLibrary', () => {
  const mockTeamId = 'test-team-id';
  const mockFiles = [
    {
      $id: 'file-1',
      teamId: mockTeamId,
      fileName: 'test-image.jpg',
      fileType: 'image/jpeg',
      fileSize: 1024000,
      storageId: 'storage-1',
      previewUrl: 'https://example.com/preview.jpg',
      annotationCount: 2,
      createdAt: '2024-01-01T00:00:00.000Z'
    },
    {
      $id: 'file-2',
      teamId: mockTeamId,
      fileName: 'document.pdf',
      fileType: 'application/pdf',
      fileSize: 2048000,
      storageId: 'storage-2',
      previewUrl: null,
      annotationCount: 0,
      createdAt: '2024-01-02T00:00:00.000Z'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    fileService.getTeamFiles.mockResolvedValue(mockFiles);
    fileService.subscribeToFiles.mockResolvedValue(() => {});
  });

  it('renders file library with team files', async () => {
    render(<FileLibrary teamId={mockTeamId} />);

    // Check if loading state is shown initially
    expect(screen.getByText('Team Files')).toBeInTheDocument();

    // Wait for files to load
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();
    });

    // Check if file count badge is shown
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows empty state when no files exist', async () => {
    fileService.getTeamFiles.mockResolvedValue([]);
    
    render(<FileLibrary teamId={mockTeamId} />);

    await waitFor(() => {
      expect(screen.getByText('No files uploaded yet')).toBeInTheDocument();
      expect(screen.getByText('Upload files to share with your team')).toBeInTheDocument();
    });
  });

  it('displays file information correctly', async () => {
    render(<FileLibrary teamId={mockTeamId} />);

    await waitFor(() => {
      // Check file names
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      expect(screen.getByText('document.pdf')).toBeInTheDocument();

      // Check file types
      expect(screen.getByText('Image')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();

      // Check annotation count
      expect(screen.getByText('2 annotations')).toBeInTheDocument();
    });
  });

  it('sets up real-time subscription on mount', async () => {
    render(<FileLibrary teamId={mockTeamId} />);

    await waitFor(() => {
      expect(fileService.subscribeToFiles).toHaveBeenCalledWith(
        mockTeamId,
        expect.any(Function)
      );
    });
  });

  it('calls getTeamFiles on mount', async () => {
    render(<FileLibrary teamId={mockTeamId} />);

    await waitFor(() => {
      expect(fileService.getTeamFiles).toHaveBeenCalledWith(mockTeamId);
    });
  });
});