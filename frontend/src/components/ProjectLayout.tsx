import { ReactNode, useState } from 'react'
import { Navigation } from './Navigation'
import { ProtectedRoute } from './ProtectedRoute'
import { Project } from '../types'

interface ProjectLayoutProps {
  children: ReactNode
}

export const ProjectLayout = ({ children }: ProjectLayoutProps) => {
  const [project, setProject] = useState<Project | null>(null)

  return (
    <ProtectedRoute onProjectLoad={setProject}>
      <div className="min-h-screen bg-gray-50">
        <Navigation project={project || undefined} />
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  )
}