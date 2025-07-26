import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConnectionStatus } from './ConnectionStatus';
import { useConnectionStatus } from '../hooks/useSocket';
import { socketService } from '../services/socket';

// Mock the hooks and services
vi.mock('../hooks/useSocket', () => ({
  useConnectionStatus: vi.fn(),
}));

vi.mock('../services/socket', () => ({
  socketService: {
    reconnect: vi.fn(),
  },
}));

describe('ConnectionStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display connected status', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Connected').closest('div')).toHaveClass('text-green-600');
  });

  it('should display connected status with details', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus showDetails={true} />);

    expect(screen.getByText('Connected')).toBeInTheDocument();
    expect(screen.getByText('Real-time updates active')).toBeInTheDocument();
  });

  it('should display reconnecting status', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: true,
      reconnectAttempts: 2,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.getByText('Reconnecting...').closest('div')).toHaveClass('text-yellow-600');
  });

  it('should display reconnecting status with details', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: true,
      reconnectAttempts: 2,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus showDetails={true} />);

    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
    expect(screen.getByText('Attempt 2/5')).toBeInTheDocument();
  });

  it('should display disconnected status', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 5,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('Disconnected').closest('div')).toHaveClass('text-red-600');
  });

  it('should display disconnected status with details', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 5,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus showDetails={true} />);

    expect(screen.getByText('Disconnected')).toBeInTheDocument();
    expect(screen.getByText('Real-time updates unavailable')).toBeInTheDocument();
  });

  it('should show reconnect button when appropriate', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 5,
      maxReconnectAttempts: 5,
      showReconnectButton: true,
    });

    render(<ConnectionStatus showDetails={true} />);

    const reconnectButton = screen.getByText('Reconnect');
    expect(reconnectButton).toBeInTheDocument();
    expect(reconnectButton).toHaveClass('bg-blue-500');
  });

  it('should call reconnect when button is clicked', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 5,
      maxReconnectAttempts: 5,
      showReconnectButton: true,
    });

    render(<ConnectionStatus showDetails={true} />);

    const reconnectButton = screen.getByText('Reconnect');
    fireEvent.click(reconnectButton);

    expect(socketService.reconnect).toHaveBeenCalled();
  });

  it('should not show reconnect button when not appropriate', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: true,
      reconnectAttempts: 2,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus showDetails={true} />);

    expect(screen.queryByText('Reconnect')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus className="custom-class" />);

    const container = screen.getByText('Connected').closest('div');
    expect(container).toHaveClass('custom-class');
  });

  it('should have proper accessibility attributes', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus />);

    // Check that the status indicator has proper visual cues
    const statusIndicator = screen.getByText('Connected').previousElementSibling;
    expect(statusIndicator).toHaveClass('w-2', 'h-2', 'bg-green-500', 'rounded-full');
  });

  it('should show pulsing animation for connected and reconnecting states', () => {
    // Test connected state
    (useConnectionStatus as any).mockReturnValue({
      connected: true,
      reconnecting: false,
      reconnectAttempts: 0,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    const { rerender } = render(<ConnectionStatus />);
    
    let statusIndicator = screen.getByText('Connected').previousElementSibling;
    expect(statusIndicator).toHaveClass('animate-pulse');

    // Test reconnecting state
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: true,
      reconnectAttempts: 1,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    rerender(<ConnectionStatus />);
    
    statusIndicator = screen.getByText('Reconnecting...').previousElementSibling;
    expect(statusIndicator).toHaveClass('animate-pulse');
  });

  it('should not show pulsing animation for disconnected state', () => {
    (useConnectionStatus as any).mockReturnValue({
      connected: false,
      reconnecting: false,
      reconnectAttempts: 5,
      maxReconnectAttempts: 5,
      showReconnectButton: false,
    });

    render(<ConnectionStatus />);
    
    const statusIndicator = screen.getByText('Disconnected').previousElementSibling;
    expect(statusIndicator).not.toHaveClass('animate-pulse');
  });
});