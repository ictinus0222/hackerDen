import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Whiteboard from '../Whiteboard';

// Mock Appwrite
vi.mock('../../lib/appwrite', () => ({
  databases: {
    listDocuments: vi.fn().mockResolvedValue({ documents: [] }),
    createDocument: vi.fn().mockResolvedValue({}),
    updateDocument: vi.fn().mockResolvedValue({}),
    deleteDocument: vi.fn().mockResolvedValue({})
  },
  default: {
    subscribe: vi.fn().mockReturnValue(() => {})
  },
  ID: {
    unique: vi.fn().mockReturnValue('test-id')
  },
  Query: {
    equal: vi.fn().mockReturnValue('mock-query')
  }
}));

// Mock team hook
vi.mock('../../hooks/useHackathonTeam', () => ({
  useHackathonTeam: vi.fn().mockReturnValue({
    team: { $id: 'test-team-id', name: 'Test Team' },
    loading: false
  })
}));

// Mock router
vi.mock('react-router-dom', () => ({
  useParams: vi.fn().mockReturnValue({
    hackathonId: 'test-hackathon-id'
  })
}));

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_APPWRITE_DATABASE_ID: 'test-database-id'
  }
}));

describe('Whiteboard Component', () => {
  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      strokeStyle: '',
      lineWidth: 1,
      lineCap: '',
      lineJoin: '',
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeRect: vi.fn(),
      arc: vi.fn(),
      setLineDash: vi.fn(),
      drawImage: vi.fn()
    });
  });

  it('renders whiteboard canvas', () => {
    render(<Whiteboard />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('renders toolbar with drawing tools', () => {
    render(<Whiteboard />);
    
    // Check for tool buttons (using title attributes)
    expect(screen.getByTitle('Select/Move')).toBeInTheDocument();
    expect(screen.getByTitle('Pen')).toBeInTheDocument();
    expect(screen.getByTitle('Pan')).toBeInTheDocument();
  });

  it('renders shape tools', () => {
    render(<Whiteboard />);
    
    expect(screen.getByTitle('Add Rectangle')).toBeInTheDocument();
    expect(screen.getByTitle('Add Circle')).toBeInTheDocument();
  });

  it('renders color and stroke controls', () => {
    render(<Whiteboard />);
    
    expect(screen.getByTitle('Color')).toBeInTheDocument();
    expect(screen.getByTitle('Stroke Width')).toBeInTheDocument();
  });

  it('renders image upload control', () => {
    render(<Whiteboard />);
    
    expect(screen.getByText('📷 Add Image')).toBeInTheDocument();
  });

  it('renders zoom controls', () => {
    render(<Whiteboard />);
    
    expect(screen.getByText('🔍+')).toBeInTheDocument();
    expect(screen.getByText('🔍-')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Whiteboard />);
    
    const canvas = document.querySelector('canvas');
    expect(canvas).toHaveStyle({ cursor: 'crosshair' });
  });
});