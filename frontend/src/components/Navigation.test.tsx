import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { Navigation } from './Navigation'
import { Project } from '../types'

const mockProject: Project = {
  id: 'test-project-id',
  projectName: 'Test Project',
  oneLineIdea: 'A test project for navigation',
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

const renderWithRouter = (component: React.ReactElement, initialEntries = ['/project/test-project-id']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/project/:id" element={component} />
        <Route path="/project/:id/*" element={component} />
      </Routes>
    </MemoryRouter>
  )
}

describe('Navigation', () => {
  it('renders nothing when no project is provided', () => {
    const { container } = renderWithRouter(<Navigation />)
    expect(container.firstChild).toBeNull()
  })

  it('renders project name and navigation links when project is provided', () => {
    renderWithRouter(<Navigation project={mockProject} />)
    
    expect(screen.getByText('Test Project')).toBeInTheDocument()
    expect(screen.getByText('A test project for navigation')).toBeInTheDocument()
    
    expect(screen.getByText('Project Hub')).toBeInTheDocument()
    expect(screen.getByText('Task Board')).toBeInTheDocument()
    expect(screen.getByText('Pivot Log')).toBeInTheDocument()
    expect(screen.getByText('Submission')).toBeInTheDocument()
  })

  it('generates correct navigation links with project ID', () => {
    renderWithRouter(<Navigation project={mockProject} />)
    
    const projectHubLink = screen.getByRole('link', { name: /Project Hub/ })
    const taskBoardLink = screen.getByRole('link', { name: /Task Board/ })
    const pivotLogLink = screen.getByRole('link', { name: /Pivot Log/ })
    const submissionLink = screen.getByRole('link', { name: /Submission/ })
    
    expect(projectHubLink).toHaveAttribute('href', '/project/test-project-id')
    expect(taskBoardLink).toHaveAttribute('href', '/project/test-project-id/tasks')
    expect(pivotLogLink).toHaveAttribute('href', '/project/test-project-id/pivots')
    expect(submissionLink).toHaveAttribute('href', '/project/test-project-id/submission')
  })

  it('shows icons for mobile view', () => {
    renderWithRouter(<Navigation project={mockProject} />)
    
    expect(screen.getByText('🏠')).toBeInTheDocument()
    expect(screen.getByText('📋')).toBeInTheDocument()
    expect(screen.getByText('🔄')).toBeInTheDocument()
    expect(screen.getByText('📤')).toBeInTheDocument()
  })

  it('truncates long project names and ideas', () => {
    const longProject = {
      ...mockProject,
      projectName: 'This is a very long project name that should be truncated',
      oneLineIdea: 'This is a very long project idea that should also be truncated in the navigation'
    }
    
    renderWithRouter(<Navigation project={longProject} />)
    
    const projectName = screen.getByText(longProject.projectName)
    const projectIdea = screen.getByText(longProject.oneLineIdea)
    
    expect(projectName).toHaveClass('truncate')
    expect(projectIdea).toHaveClass('truncate')
  })
})