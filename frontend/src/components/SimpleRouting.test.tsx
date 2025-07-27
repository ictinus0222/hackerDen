import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Navigation } from './Navigation'
import { ProtectedRoute } from './ProtectedRoute'
import { HomePage } from './HomePage'
import { ProjectShare } from './ProjectShare'
import * as apiModule from '../services/api'
import { Project } from '../types'
import { ToastProvider } from '../hooks/useToast'

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

describe('Simple Routing Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockApi.getProject.mockResolvedValue(mockProject)
  })

  it('renders home page at root path', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ToastProvider position="top-right">
          <Routes>
            <Route path="/" element={<HomePage />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )
    
    expect(screen.getByText('hackerDen')).toBeInTheDocument()
    expect(screen.getByText('Create New Project')).toBeInTheDocument()
  })

  it('renders navigation with project data', () => {
    render(
      <MemoryRouter initialEntries={['/project/test-project-id']}>
        <Routes>
          <Route path="/project/:id" element={<Navigation project={mockProject} />} />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('Project Hub')).toBeInTheDocument()
    expect(screen.getByText('Task Board')).toBeInTheDocument()
  })

  it('renders project share component with correct URL', () => {
    render(
      <MemoryRouter initialEntries={['/project/test-project-id']}>
        <ToastProvider position="top-right">
          <Routes>
            <Route path="/project/:id" element={<ProjectShare />} />
          </Routes>
        </ToastProvider>
      </MemoryRouter>
    )
    
    expect(screen.getByDisplayValue(/project\/test-project-id/)).toBeInTheDocument()
  })

  it('renders protected route with project loading', async () => {
    render(
      <MemoryRouter initialEntries={['/project/test-project-id']}>
        <Routes>
          <Route path="/project/:id" element={
            <ProtectedRoute>
              <div>Protected Content</div>
            </ProtectedRoute>
          } />
        </Routes>
      </MemoryRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
    
    expect(mockApi.getProject).toHaveBeenCalledWith('test-project-id')
  })

  it('shows 404 for unknown routes', () => {
    render(
      <MemoryRouter initialEntries={['/unknown-route']}>
        <Routes>
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                <a href="/" className="text-blue-600 hover:text-blue-800 underline">
                  Go to Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </MemoryRouter>
    )
    
    expect(screen.getByText('Page Not Found')).toBeInTheDocument()
    expect(screen.getByText('Go to Home')).toBeInTheDocument()
  })
})