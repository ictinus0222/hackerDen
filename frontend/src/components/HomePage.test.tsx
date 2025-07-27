import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { HomePage } from './HomePage'
import * as apiModule from '../services/api'
import { ToastProvider } from '../hooks/useToast'

// Mock the API
vi.mock('../services/api')
const mockApi = vi.mocked(apiModule.api)

// Mock useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate
  }
})

const renderWithProviders = () => {
  return render(
    <BrowserRouter>
      <ToastProvider position="top-right">
        <HomePage />
      </ToastProvider>
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the home page with create project form', () => {
    renderWithProviders()
    
    expect(screen.getByText('hackerDen')).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
    expect(screen.getByText('Join Existing Project')).toBeInTheDocument()
    
    expect(screen.getByLabelText('Project Name *')).toBeInTheDocument()
    expect(screen.getByLabelText('One-Line Idea')).toBeInTheDocument()
  })

  it('creates a project and navigates on successful submission', async () => {
    const user = userEvent.setup()
    const mockProject = { id: 'new-project-id' }
    mockApi.createProject.mockResolvedValue(mockProject)
    
    renderWithProviders()
    
    const projectNameInput = screen.getByLabelText('Project Name *')
    const ideaInput = screen.getByLabelText('One-Line Idea')
    const createButton = screen.getByRole('button', { name: 'Create Project' })
    
    await user.type(projectNameInput, 'My Hackathon Project')
    await user.type(ideaInput, 'A revolutionary idea')
    await user.click(createButton)
    
    await waitFor(() => {
      expect(mockApi.createProject).toHaveBeenCalledWith({
        projectName: 'My Hackathon Project',
        oneLineIdea: 'A revolutionary idea',
        teamMembers: [],
        deadlines: expect.any(Object),
        judgingCriteria: [],
        pivotLog: []
      })
      expect(mockNavigate).toHaveBeenCalledWith('/project/new-project-id')
    })
  })

  it('shows error when project name is empty', async () => {
    const user = userEvent.setup()
    renderWithProviders()
    
    const createButton = screen.getByRole('button', { name: 'Create Project' })
    await user.click(createButton)
    
    // Should not call API
    expect(mockApi.createProject).not.toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup()
    mockApi.createProject.mockRejectedValue(new Error('Server error'))
    
    renderWithProviders()
    
    const projectNameInput = screen.getByLabelText('Project Name *')
    const createButton = screen.getByRole('button', { name: 'Create Project' })
    
    await user.type(projectNameInput, 'My Project')
    await user.click(createButton)
    
    await waitFor(() => {
      expect(mockApi.createProject).toHaveBeenCalled()
      // Should not navigate on error
      expect(mockNavigate).not.toHaveBeenCalled()
    })
  })

  it('shows loading state during project creation', async () => {
    const user = userEvent.setup()
    mockApi.createProject.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithProviders()
    
    const projectNameInput = screen.getByLabelText('Project Name *')
    const createButton = screen.getByRole('button', { name: 'Create Project' })
    
    await user.type(projectNameInput, 'My Project')
    await user.click(createButton)
    
    expect(screen.getByText('Creating...')).toBeInTheDocument()
    expect(createButton).toBeDisabled()
  })

  it('handles join project functionality', async () => {
    const user = userEvent.setup()
    
    // Mock window.prompt
    const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('test-project-id')
    
    renderWithProviders()
    
    const joinButton = screen.getByRole('button', { name: 'Join Project' })
    await user.click(joinButton)
    
    expect(mockPrompt).toHaveBeenCalledWith('Enter project ID or URL:')
    expect(mockNavigate).toHaveBeenCalledWith('/project/test-project-id')
    
    mockPrompt.mockRestore()
  })

  it('extracts project ID from full URL when joining', async () => {
    const user = userEvent.setup()
    
    // Mock window.prompt with full URL
    const mockPrompt = vi.spyOn(window, 'prompt').mockReturnValue('https://example.com/project/test-project-id/tasks')
    
    renderWithProviders()
    
    const joinButton = screen.getByRole('button', { name: 'Join Project' })
    await user.click(joinButton)
    
    expect(mockNavigate).toHaveBeenCalledWith('/project/test-project-id')
    
    mockPrompt.mockRestore()
  })

  it('displays feature icons and descriptions', () => {
    renderWithProviders()
    
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('Project Hub')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('Task Board')).toBeInTheDocument()
    expect(screen.getByText('🔄')).toBeInTheDocument()
    expect(screen.getByText('Pivot Tracking')).toBeInTheDocument()
    expect(screen.getByText('📤')).toBeInTheDocument()
    expect(screen.getByText('Submission Package')).toBeInTheDocument()
  })
})