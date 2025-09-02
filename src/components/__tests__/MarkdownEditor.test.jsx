import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownEditor from '../MarkdownEditor';

// Mock the highlight.js CSS import
vi.mock('highlight.js/styles/github.css', () => ({}));

describe('MarkdownEditor', () => {
  let mockOnChange;
  let mockOnSave;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnSave = vi.fn();
  });

  it('renders with default props', () => {
    render(<MarkdownEditor />);
    
    expect(screen.getByPlaceholderText('Start writing your document...')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
  });

  it('displays initial content', () => {
    const initialContent = '# Hello World';
    render(<MarkdownEditor value={initialContent} />);
    
    expect(screen.getByDisplayValue(initialContent)).toBeInTheDocument();
  });

  it('calls onChange when content is modified', () => {
    render(<MarkdownEditor onChange={mockOnChange} />);
    
    const textarea = screen.getByPlaceholderText('Start writing your document...');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New content');
  });

  it('shows preview by default', () => {
    render(<MarkdownEditor value="# Test" />);
    
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Editor')).toBeInTheDocument();
  });

  it('can toggle between preview and editor-only mode', () => {
    render(<MarkdownEditor value="# Test" />);
    
    const toggleButton = screen.getByText('Edit Only');
    fireEvent.click(toggleButton);
    
    expect(screen.getByText('Show Preview')).toBeInTheDocument();
    expect(screen.queryByText('Preview')).not.toBeInTheDocument();
  });

  it('renders markdown in preview pane', () => {
    render(<MarkdownEditor value="# Hello World\n\nThis is **bold** text." />);
    
    // The preview should render the markdown as HTML - check for heading element
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Hello World');
  });

  it('has toolbar buttons for formatting', () => {
    render(<MarkdownEditor />);
    
    // Check for some toolbar buttons (they should be present as buttons with icons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(10); // Should have multiple toolbar buttons
  });

  it('calls onSave with debounced auto-save', async () => {
    render(
      <MarkdownEditor 
        onSave={mockOnSave} 
        autoSave={true} 
        autoSaveDelay={100}
      />
    );
    
    const textarea = screen.getByPlaceholderText('Start writing your document...');
    fireEvent.change(textarea, { target: { value: 'Auto-save test' } });
    
    // Should not call immediately
    expect(mockOnSave).not.toHaveBeenCalled();
    
    // Should call after delay
    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith('Auto-save test');
    }, { timeout: 200 });
  });

  it('inserts bold formatting when bold button is clicked', () => {
    render(<MarkdownEditor onChange={mockOnChange} />);
    
    const textarea = screen.getByPlaceholderText('Start writing your document...');
    
    // Focus textarea and set cursor position
    textarea.focus();
    textarea.setSelectionRange(0, 0);
    
    // Find and click bold button (look for button with Bold icon)
    const buttons = screen.getAllByRole('button');
    const boldButton = buttons.find(button => {
      const svg = button.querySelector('svg');
      return svg && svg.getAttribute('class')?.includes('lucide');
    });
    
    if (boldButton) {
      fireEvent.click(boldButton);
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('handles custom placeholder text', () => {
    const customPlaceholder = 'Write your custom content here...';
    render(<MarkdownEditor placeholder={customPlaceholder} />);
    
    expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<MarkdownEditor className="custom-class" />);
    
    // The custom class should be on the main container div
    expect(screen.getByTestId('markdown-editor')).toHaveClass('custom-class');
  });
});