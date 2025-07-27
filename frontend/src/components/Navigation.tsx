import { NavLink, useParams } from 'react-router-dom'
import { ProjectHub } from '../types'

interface NavigationProps {
  project?: ProjectHub
}

export const Navigation = ({ project }: NavigationProps) => {
  const { id: projectId } = useParams<{ id: string }>()

  if (!project) {
    return null
  }

  const actualProjectId = projectId || (project as any).id

  const navItems = [
    {
      to: `/project/${actualProjectId}`,
      label: 'Project Hub',
      icon: '🏠',
      description: 'Project overview and team management'
    },
    {
      to: `/project/${actualProjectId}/tasks`,
      label: 'Task Board',
      icon: '📋',
      description: 'Kanban-style task management'
    },
    {
      to: `/project/${actualProjectId}/pivots`,
      label: 'Pivot Log',
      icon: '🔄',
      description: 'Track direction changes'
    },
    {
      to: `/project/${actualProjectId}/submission`,
      label: 'Submission',
      icon: '📤',
      description: 'Generate submission package'
    }
  ]

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Project Info */}
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900 truncate max-w-xs sm:max-w-md">
              {project.projectName}
            </h1>
            {project.oneLineIdea && (
              <span className="hidden sm:block ml-3 text-sm text-gray-500 truncate max-w-xs">
                {project.oneLineIdea}
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1 sm:space-x-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
                title={item.description}
              >
                <span className="text-base sm:mr-2">{item.icon}</span>
                <span className="hidden sm:block">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}