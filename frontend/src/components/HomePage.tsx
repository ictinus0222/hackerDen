import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { useToast } from '../hooks/useToast'

export const HomePage = () => {
  const [projectName, setProjectName] = useState('')
  const [oneLineIdea, setOneLineIdea] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!projectName.trim()) {
      showToast('Project name is required', 'error')
      return
    }

    try {
      setLoading(true)
      const project = await api.createProject({
        projectName: projectName.trim(),
        oneLineIdea: oneLineIdea.trim() || undefined,
        teamMembers: [],
        deadlines: {
          hackingEnds: new Date(),
          submissionDeadline: new Date(),
          presentationTime: new Date()
        },
        judgingCriteria: [],
        pivotLog: []
      })

      showToast('Project created successfully!', 'success')
      navigate(`/project/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
      showToast('Failed to create project. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinProject = () => {
    const projectId = prompt('Enter project ID or URL:')
    if (projectId) {
      // Extract project ID from URL if full URL is provided
      const match = projectId.match(/\/project\/([^\/]+)/)
      const id = match ? match[1] : projectId
      navigate(`/project/${id}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">hackerDen</h1>
          <p className="text-gray-600">
            Streamline your hackathon workflow from formation to submission
          </p>
        </div>

        {/* Create Project Form */}
        <div className="bg-white shadow-xl rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Create New Project
          </h2>
          
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                id="projectName"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your project name"
                required
              />
            </div>

            <div>
              <label htmlFor="oneLineIdea" className="block text-sm font-medium text-gray-700 mb-1">
                One-Line Idea
              </label>
              <input
                type="text"
                id="oneLineIdea"
                value={oneLineIdea}
                onChange={(e) => setOneLineIdea(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your idea in one sentence"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>

        {/* Join Project */}
        <div className="bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Join Existing Project
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Have a project ID or URL? Join your team's project.
          </p>
          <button
            onClick={handleJoinProject}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Join Project
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="block text-lg mb-1">🏠</span>
              Project Hub
            </div>
            <div>
              <span className="block text-lg mb-1">📋</span>
              Task Board
            </div>
            <div>
              <span className="block text-lg mb-1">🔄</span>
              Pivot Tracking
            </div>
            <div>
              <span className="block text-lg mb-1">📤</span>
              Submission Package
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}