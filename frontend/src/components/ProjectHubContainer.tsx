import React, { useEffect } from 'react';
import { ProjectHub } from './ProjectHub';
import { useProject } from '../hooks/useProject';
import type { ProjectHub as ProjectHubType } from '../types';

interface ProjectHubContainerProps {
  projectId?: string;
  initialProject?: ProjectHubType;
  canEdit?: boolean;
}

export const ProjectHubContainer: React.FC<ProjectHubContainerProps> = ({
  projectId,
  initialProject,
  canEdit = true
}) => {
  const {
    project,
    loading,
    error,
    saving,
    loadProject,
    updateProject,
    addTeamMember,
    removeTeamMember,
    clearError,
    setProject
  } = useProject(initialProject);

  // Load project on mount if projectId is provided and no initial project
  useEffect(() => {
    if (projectId && !initialProject) {
      loadProject(projectId);
    }
  }, [projectId, initialProject, loadProject]);

  // Set initial project if provided
  useEffect(() => {
    if (initialProject) {
      setProject(initialProject);
    }
  }, [initialProject, setProject]);

  const handleUpdateProject = async (updates: Partial<ProjectHubType>) => {
    await updateProject(updates);
  };

  const handleAddMember = async (name: string, role?: string) => {
    await addTeamMember(name, role);
  };

  const handleRemoveMember = async (memberId: string) => {
    await removeTeamMember(memberId);
  };

  // Loading state
  if (loading && !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading project...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error Loading Project</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          {projectId && (
            <div className="mt-4">
              <button
                onClick={() => loadProject(projectId)}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // No project state
  if (!project) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">No project loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Error notification */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg max-w-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto">
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success notification for saves */}
      {saving && (
        <div className="fixed top-4 right-4 z-50 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <p className="text-sm text-blue-700">Saving changes...</p>
          </div>
        </div>
      )}

      {/* Loading overlay when saving */}
      {saving && (
        <div className="absolute inset-0 bg-white bg-opacity-50 z-10 pointer-events-none" />
      )}

      <ProjectHub
        project={project}
        onUpdateProject={handleUpdateProject}
        onAddMember={handleAddMember}
        onRemoveMember={handleRemoveMember}
        canEdit={canEdit && !saving}
      />
    </div>
  );
};