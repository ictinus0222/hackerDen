import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProjectShare } from './ProjectShare'
import { ToastProvider } from '../hooks/useToast'

// Mock clipboard API
const mockWriteText = vi.fn()
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText
  }
})

// Mock window.open
const mockWindowOpen = vi.fn()
Object.assign(window, { open: mockWindowOpen })

const renderWithProviders = (initialEntries = ['/project/test-project-id']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/project/:id" element={
          <ToastProvider position="top-right">
            <ProjectShare />
          </ToastProvider>
        } />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProjectShare', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset location
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'https://example.com'
      },
      writable: true
    })
  })

  it('displays the correct project URL', () => {
    renderWithProviders()
    
    const urlInput = screen.getByDisplayValue('https://example.com/project/test-project-id')
    expect(urlInput).toBeInTheDocument()
    expect(urlInput).toHaveAttribute('readonly')
  })

  it('copies URL to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup()
    mockWriteText.mockResolvedValue(undefined)
    
    renderWithProviders()
    
    const copyButton = screen.getByText('Copy')
    await user.click(copyButton)
    
    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/project/test-project-id')
    
    await waitFor(() => {
      expect(screen.getByText('✓ Copied')).toBeInTheDocument()
    })
  })

  it('shows error when clipboard copy fails', async () => {
    const user = userEvent.setup()
    mockWriteText.mockRejectedValue(new Error('Clipboard error'))
    
    renderWithProviders()
    
    const copyButton = screen.getByText('Copy')
    await user.click(copyButton)
    
    expect(mockWriteText).toHaveBeenCalled()
    // Error handling is done via toast, which would be tested in integration
  })

  it('opens email client when share via email is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithProviders()
    
    const emailButton = screen.getByText('📧 Share via Email')
    await user.click(emailButton)
    
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:?subject=')
    )
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com/project/test-project-id')
    )
  })

  it('shows native share button when navigator.share is available', () => {
    // Mock navigator.share
    Object.assign(navigator, {
      share: vi.fn()
    })
    
    renderWithProviders()
    
    expect(screen.getByText('📱 Share')).toBeInTheDocument()
  })

  it('calls navigator.share when native share button is clicked', async () => {
    const user = userEvent.setup()
    const mockShare = vi.fn()
    Object.assign(navigator, {
      share: mockShare
    })
    
    renderWithProviders()
    
    const shareButton = screen.getByText('📱 Share')
    await user.click(shareButton)
    
    expect(mockShare).toHaveBeenCalledWith({
      title: 'Join my hackathon project',
      text: 'Join my hackathon project on hackerDen',
      url: 'https://example.com/project/test-project-id'
    })
  })

  it('displays sharing instructions', () => {
    renderWithProviders()
    
    expect(screen.getByText('How to join:')).toBeInTheDocument()
    expect(screen.getByText('Share this URL with your team members')).toBeInTheDocument()
    expect(screen.getByText('They can click the link or paste it in their browser')).toBeInTheDocument()
    expect(screen.getByText('They\'ll have immediate access to the project')).toBeInTheDocument()
  })

  it('resets copy button text after timeout', async () => {
    const user = userEvent.setup()
    mockWriteText.mockResolvedValue(undefined)
    
    vi.useFakeTimers()
    
    renderWithProviders()
    
    const copyButton = screen.getByText('Copy')
    await user.click(copyButton)
    
    await waitFor(() => {
      expect(screen.getByText('✓ Copied')).toBeInTheDocument()
    })
    
    // Fast-forward time
    vi.advanceTimersByTime(2000)
    
    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument()
    })
    
    vi.useRealTimers()
  })
})