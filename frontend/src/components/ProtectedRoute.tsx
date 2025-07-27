import { ReactNode, useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Project } from '../types'
import { api } from '../services/api'
import { LoadingSpinner } from './LoadingStates'

interface ProtectedRouteProps {
  children: ReactNode
  onProjectLoad?: (project: Project) => void
}

export const ProtectedRoute = ({ children, onProjectLoad }: ProtectedRouteProps) => {
  const { id: projectId } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) {
        setError('Project ID is required')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const projectData = await api.getProject(projectId)
        setProject(projectData)
        onProjectLoad?.(projectData)
      } catch (err) {
        console.error('Failed to load project:', err)
        setError(err instanceof Error ? err.message : 'Failed to load project')
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [projectId, onProjectLoad])

  if (loading) {
    return <LoadingSpinner />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <span className="text-red-600 text-xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
            Project Not Found
          </h2>
          <p className="text-gray-600 text-center mb-4">
            {error}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => window.location.href = '/'}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create New Project
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}