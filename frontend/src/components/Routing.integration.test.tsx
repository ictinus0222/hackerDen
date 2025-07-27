import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from '../App'
import * as apiModule from '../services/api'
import { Project } from '../types'

// Mock the API
vi.mock('../services/api')
const mockApi = vi.mocked(apiModule.api)

// Mock socket service
vi.mock('../services/socket', () => ({
  socketService: {
    connect: vi.fn(),
    disconnect: vi.fn(),
    isConnected: vi.fn(() => true),
    getReconnectAttempts: vi.fn(() => 0),
    joinProject: vi.fn(),
    leaveProject: vi.fn(),
    getCurrentProjectId: vi.fn(() => null),
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    reconnect: vi.fn()
  }
}))

const mockProject: Project = {
  id: 'test-project-id',
  projectName: 'Test Project',
  oneLineIdea: 'A test project',
  teamMembers: [],
  deadlines: {
    hackingEnds: new Date(),
    submissionDeadline: new Date(),
    presentationTime: new Date()
  },
  judgingCriteria: [],
  pivotLog: [],
  createdAt: new Date(),
  updatedAt: new Date()
}

// Mock components to avoid complex rendering
vi.mock('./ProjectHubContainer', () => ({
  default: () => <div data-testid="project-hub">Project Hub Container</div>
}))

vi.mock('./TaskBoard', () => ({
  default: () => <div data-testid="task-board">Task Board</div>
}))

vi.mock('./PivotLog', () => ({
  default: () => <div data-testid="pivot-log">Pivot Log</div>
}))

vi.mock('./SubmissionPackage', () => ({
  default: () => <div data-testid="submission-package">Submission Package</div>
}))

vi.mock('./PublicSubmissionPage', () => ({
  default: () => <div data-testid="public-submission">Public Submission Page</div>
}))

const renderApp = (initialEntries = ['/']) => {
  return render(<App />)
}

describe('Routing Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getProject.mockResolvedValue(mockProject)
  })

  it('renders home page at root path', async () => {
    renderApp(['/'])
    
    await waitFor(() => {
      expect(screen.getByText('hackerDen')).toBeInTheDocument()
      expect(screen.getByText('Create New Project')).toBeInTheDocument()
    })
  })

  it('renders 404 page for unknown routes', async () => {
    renderApp(['/unknown-route'])
    
    await waitFor(() => {
      expect(screen.getByText('Page Not Found')).toBeInTheDocument()
      expect(screen.getByText('Go to Home')).toBeInTheDocument()
    })
  })

  it('renders public submission page without authentication', async () => {
    renderApp(['/submission/test-id/public'])
    
    await waitFor(() => {
      expect(screen.getByTestId('public-submission')).toBeInTheDocument()
    })
    
    // Should not call getProject for public pages
    expect(mockApi.getProject).not.toHaveBeenCalled()
  })

  it('protects project routes and loads project data', async () => {
    renderApp(['/project/test-project-id'])
    
    await waitFor(() => {
      expect(mockApi.getProject).toHaveBeenCalledWith('test-project-id')
      expect(screen.getByTestId('project-hub')).toBeInTheDocument()
    })
  })

  it('renders navigation for protected routes', async () => {
    renderApp(['/project/test-project-id'])
    
    await waitFor(() => {
      expect(screen.getByText('Test Project')).toBeInTheDocument()
      expect(screen.getByText('Project Hub')).toBeInTheDocument()
      expect(screen.getByText('Task Board')).toBeInTheDocument()
      expect(screen.getByText('Pivot Log')).toBeInTheDocument()
      expect(screen.getByText('Submission')).toBeInTheDocument()
    })
  })

  it('navigates between project phases', async () => {
    const user = userEvent.setup()
    renderApp(['/project/test-project-id'])
    
    await waitFor(() => {
      expect(screen.getByTestId('project-hub')).toBeInTheDocument()
    })
    
    // Navigate to task board
    const taskBoardLink = screen.getByRole('link', { name: /Task Board/ })
    await user.click(taskBoardLink)
    
    await waitFor(() => {
      expect(screen.getByTestId('task-board')).toBeInTheDocument()
    })
    
    // Navigate to pivot log
    const pivotLogLink = screen.getByRole('link', { name: /Pivot Log/ })
    await user.click(pivotLogLink)
    
    await waitFor(() => {
      expect(screen.getByTestId('pivot-log')).toBeInTheDocument()
    })
    
    // Navigate to submission
    const submissionLink = screen.getByRole('link', { name: /Submission/ })
    await user.click(submissionLink)
    
    await waitFor(() => {
      expect(screen.getByTestId('submission-package')).toBeInTheDocument()
    })
  })

  it('shows error page when project fails to load', async () => {
    mockApi.getProject.mockRejectedValue(new Error('Project not found'))
    
    renderApp(['/project/invalid-id'])
    
    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument()
      expect(screen.getByText('Project not found')).toBeInTheDocument()
    })
  })

  it('redirects to home when project is null', async () => {
    mockApi.getProject.mockResolvedValue(null as any)
    
    renderApp(['/project/null-project'])
    
    await waitFor(() => {
      expect(screen.getByText('hackerDen')).toBeInTheDocument()
    })
  })

  it('maintains project context across route changes', async () => {
    const user = userEvent.setup()
    renderApp(['/project/test-project-id'])
    
    // Wait for initial load
    await waitFor(() => {
      expect(mockApi.getProject).toHaveBeenCalledTimes(1)
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })
    
    // Navigate to different routes
    const taskBoardLink = screen.getByRole('link', { name: /Task Board/ })
    await user.click(taskBoardLink)
    
    const pivotLogLink = screen.getByRole('link', { name: /Pivot Log/ })
    await user.click(pivotLogLink)
    
    // Should not reload project data
    expect(mockApi.getProject).toHaveBeenCalledTimes(1)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('shows loading state while fetching project', async () => {
    mockApi.getProject.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderApp(['/project/test-project-id'])
    
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('handles direct navigation to project sub-routes', async () => {
    renderApp(['/project/test-project-id/tasks'])
    
    await waitFor(() => {
      expect(mockApi.getProject).toHaveBeenCalledWith('test-project-id')
      expect(screen.getByTestId('task-board')).toBeInTheDocument()
      expect(screen.getByText('Test Project')).toBeInTheDocument()
    })
  })

  it('shows connection status on all protected routes', async () => {
    renderApp(['/project/test-project-id'])
    
    await waitFor(() => {
      expect(screen.getByText('Connected')).toBeInTheDocument()
    })
  })
})