import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from '../FileUpload';

// Mock the UI components
vi.mock('../ui/card', () => ({
  Card: ({ children, className, onClick, onDragOver, onDragLeave, onDrop, ...props }) => (
    <div 
      className={className} 
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      data-testid="upload-card"
      {...props}
    >
      {children}
    </div>
  ),
  CardContent: ({ children, className }) => (
    <div className={className} data-testid="card-content">{children}</div>
  )
}));

vi.mock('../ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, size, className, ...props }) => (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={className}
      data-variant={variant}
      data-size={size}
      data-testid="button"
      {...props}
    >
      {children}
    </button>
  )
}));

vi.mock('../ui/progress', () => ({
  Progress: ({ value, className }) => (
    <div 
      className={className} 
      data-testid="progress" 
      data-value={value}
      role="progressbar"
      aria-valuenow={value}
    />
  )
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />,
  File: () => <div data-testid="file-icon" />,
  Image: () => <div data-testid="image-icon" />,
  FileText: () => <div data-testid="filetext-icon" />,
  Code: () => <div data-testid="code-icon" />,
  Archive: () => <div data-testid="archive-icon" />
}));

// Mock utils
vi.mock('../../lib/utils', () => ({
  cn: (...classes) => classes.filter(Boolean).join(' ')
}));

describe('FileUpload', () => {
  const mockOnFileUpload = vi.fn();
  const defaultProps = {
    onFileUpload: mockOnFileUpload,
    teamId: 'team-123'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload area correctly', () => {
    render(<FileUpload {...defaultProps} />);
    
    expect(screen.getByTestId('upload-card')).toBeInTheDocument();
    expect(screen.getByTestId('upload-icon')).toBeInTheDocument();
    expect(screen.getByText('Upload files')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files here, or click to browse')).toBeInTheDocument();
    expect(screen.getByText('Supports images, PDFs, text files, code files (max 10MB each)')).toBeInTheDocument();
    expect(screen.getByText('Choose Files')).toBeInTheDocument();
  });

  it('handles file input change', () => {
    render(<FileUpload {...defaultProps} />);
    
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();

    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(file, 'team-123');
  });

  it('opens file dialog when upload area is clicked', () => {
    render(<FileUpload {...defaultProps} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const fileInput = document.querySelector('input[type="file"]');
    
    // Mock the click method
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    fireEvent.click(uploadCard);
    
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });

  it('opens file dialog when Choose Files button is clicked', () => {
    render(<FileUpload {...defaultProps} />);
    
    const chooseButton = screen.getByText('Choose Files');
    const fileInput = document.querySelector('input[type="file"]');
    
    // Mock the click method
    const clickSpy = vi.spyOn(fileInput, 'click').mockImplementation(() => {});
    
    fireEvent.click(chooseButton);
    
    expect(clickSpy).toHaveBeenCalled();
    
    clickSpy.mockRestore();
  });

  it('handles drag and drop events', () => {
    render(<FileUpload {...defaultProps} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    
    // Test drag over
    fireEvent.dragOver(uploadCard, {
      dataTransfer: {
        files: [new File(['test'], 'test.txt', { type: 'text/plain' })]
      }
    });
    
    expect(screen.getByText('Drop files here')).toBeInTheDocument();
    
    // Test drag leave
    fireEvent.dragLeave(uploadCard);
    
    expect(screen.getByText('Upload files')).toBeInTheDocument();
  });

  it('handles file drop', () => {
    render(<FileUpload {...defaultProps} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    fireEvent.drop(uploadCard, {
      dataTransfer: {
        files: [file]
      }
    });
    
    expect(mockOnFileUpload).toHaveBeenCalledWith(file, 'team-123');
  });

  it('validates file size', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<FileUpload {...defaultProps} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.txt', { type: 'text/plain' });
    
    fireEvent.drop(uploadCard, {
      dataTransfer: {
        files: [largeFile]
      }
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'File validation errors:',
      expect.arrayContaining([expect.stringContaining('File size exceeds 10MB limit')])
    );
    
    expect(mockOnFileUpload).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('validates file type', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<FileUpload {...defaultProps} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const invalidFile = new File(['test'], 'test.exe', { type: 'application/exe' });
    
    fireEvent.drop(uploadCard, {
      dataTransfer: {
        files: [invalidFile]
      }
    });
    
    expect(consoleSpy).toHaveBeenCalledWith(
      'File validation errors:',
      expect.arrayContaining([expect.stringContaining('File type not supported')])
    );
    
    expect(mockOnFileUpload).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('respects maxFiles limit', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<FileUpload {...defaultProps} maxFiles={2} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const files = [
      new File(['1'], 'test1.txt', { type: 'text/plain' }),
      new File(['2'], 'test2.txt', { type: 'text/plain' }),
      new File(['3'], 'test3.txt', { type: 'text/plain' })
    ];
    
    fireEvent.drop(uploadCard, {
      dataTransfer: { files }
    });
    
    expect(consoleSpy).toHaveBeenCalledWith('Cannot upload more than 2 files at once');
    
    expect(mockOnFileUpload).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });



  it('disables upload when disabled prop is true', () => {
    render(<FileUpload {...defaultProps} disabled={true} />);
    
    const uploadCard = screen.getByTestId('upload-card');
    const chooseButton = screen.getByText('Choose Files');
    
    expect(uploadCard).toHaveClass('opacity-50 cursor-not-allowed');
    expect(chooseButton).toBeDisabled();
  });


});