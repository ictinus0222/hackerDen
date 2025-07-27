import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import * as apiModule from '../services/api'
import { Project } from '../types'

// Mock the API
vi.mock('../services/api')
const mockApi = vi.mocked(apiModule.api)

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

const TestComponent = () => <div>Protected Content</div>

const renderWithRouter = (initialEntries = ['/project/test-project-id']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        } />
      </Routes>
    </MemoryRouter>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading spinner while fetching project', () => {
    mockApi.getProject.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    renderWithRouter()
    
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
  })

  it('renders children when project loads successfully', async () => {
    mockApi.getProject.mockResolvedValue(mockProject)
    
    renderWithRouter()
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  it('shows error message when project fails to load', async () => {
    mockApi.getProject.mockRejectedValue(new Error('Project not found'))
    
    renderWithRouter()
    
    await waitFor(() => {
      expect(screen.getByText('Project Not Found')).toBeInTheDocument()
      expect(screen.getByText('Project not found')).toBeInTheDocument()
    })
  })

  it('shows create new project button on error', async () => {
    mockApi.getProject.mockRejectedValue(new Error('Project not found'))
    
    renderWithRouter()
    
    await waitFor(() => {
      const createButton = screen.getByText('Create New Project')
      expect(createButton).toBeInTheDocument()
    })
  })

  it('calls onProjectLoad callback when project loads', async () => {
    const onProjectLoad = vi.fn()
    mockApi.getProject.mockResolvedValue(mockProject)
    
    render(
      <MemoryRouter initialEntries={['/project/test-project-id']}>
        <Routes>
          <Route path="/project/:id" element={
            <ProtectedRoute onProjectLoad={onProjectLoad}>
              <TestComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(onProjectLoad).toHaveBeenCalledWith(mockProject)
    })
  })

  it('shows error when no project ID is provided', async () => {
    render(
      <MemoryRouter initialEntries={['/invalid']}>
        <Routes>
          <Route path="/invalid" element={
            <ProtectedRoute>
              <TestComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Project ID is required')).toBeInTheDocument()
    })
  })
})