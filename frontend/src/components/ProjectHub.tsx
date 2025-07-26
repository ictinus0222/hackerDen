import React from 'react';
import type { ProjectHub as ProjectHubType, JudgingCriterion } from '../types';
import { TeamMemberList } from './TeamMember';
import { DeadlineManager } from './DeadlineManager';
import { JudgingCriteria } from './JudgingCriteria';

interface ProjectHubProps {
  project: ProjectHubType;
  onUpdateProject?: (updates: Partial<ProjectHubType>) => Promise<void> | void;
  onAddMember?: (name: string, role?: string) => Promise<void> | void;
  onRemoveMember?: (memberId: string) => Promise<void> | void;
  canEdit?: boolean;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  project,
  onUpdateProject,
  onAddMember,
  onRemoveMember,
  canEdit = false
}) => {
  const [isEditingBasics, setIsEditingBasics] = React.useState(false);
  const [editedBasics, setEditedBasics] = React.useState({
    projectName: project.projectName,
    oneLineIdea: project.oneLineIdea
  });

  React.useEffect(() => {
    setEditedBasics({
      projectName: project.projectName,
      oneLineIdea: project.oneLineIdea
    });
  }, [project.projectName, project.oneLineIdea]);

  const handleUpdateBasics = async () => {
    if (onUpdateProject) {
      try {
        await onUpdateProject({
          projectName: editedBasics.projectName,
          oneLineIdea: editedBasics.oneLineIdea
        });
        setIsEditingBasics(false);
      } catch (error) {
        // Error handling is done in the container
        console.error('Failed to update project basics:', error);
      }
    }
  };

  const handleCancelBasics = () => {
    setEditedBasics({
      projectName: project.projectName,
      oneLineIdea: project.oneLineIdea
    });
    setIsEditingBasics(false);
  };

  const handleAddMember = async (name: string, role?: string) => {
    if (onAddMember) {
      try {
        await onAddMember(name, role);
      } catch (error) {
        console.error('Failed to add team member:', error);
      }
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (onRemoveMember) {
      try {
        await onRemoveMember(memberId);
      } catch (error) {
        console.error('Failed to remove team member:', error);
      }
    }
  };

  const handleUpdateDeadlines = async (deadlines: ProjectHubType['deadlines']) => {
    if (onUpdateProject) {
      try {
        await onUpdateProject({ deadlines });
      } catch (error) {
        console.error('Failed to update deadlines:', error);
      }
    }
  };

  const handleUpdateCriteria = async (criteria: JudgingCriterion[]) => {
    if (onUpdateProject) {
      try {
        await onUpdateProject({ judgingCriteria: criteria });
      } catch (error) {
        console.error('Failed to update judging criteria:', error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center border-b pb-4 sm:pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Project Hub</h1>
        <p className="text-sm sm:text-base text-gray-600">Your team's central command center</p>
      </div>

      {/* Project Basics */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Project Vitals</h2>
          {canEdit && !isEditingBasics && (
            <button
              onClick={() => setIsEditingBasics(true)}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 self-start sm:self-auto"
            >
              Edit
            </button>
          )}
        </div>

        {isEditingBasics ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                id="projectName"
                type="text"
                value={editedBasics.projectName}
                onChange={(e) => setEditedBasics(prev => ({ ...prev, projectName: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your project name"
                required
              />
            </div>
            <div>
              <label htmlFor="oneLineIdea" className="block text-sm font-medium text-gray-700">
                One-Sentence Idea *
              </label>
              <textarea
                id="oneLineIdea"
                value={editedBasics.oneLineIdea}
                onChange={(e) => setEditedBasics(prev => ({ ...prev, oneLineIdea: e.target.value }))}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describe your project in one clear sentence"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button
                onClick={handleUpdateBasics}
                disabled={!editedBasics.projectName.trim() || !editedBasics.oneLineIdea.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelBasics}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{project.projectName}</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">{project.oneLineIdea}</p>
            </div>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <TeamMemberList
          members={project.teamMembers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          canManageMembers={canEdit}
        />
      </div>

      {/* Deadlines */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <DeadlineManager
          deadlines={project.deadlines}
          onUpdateDeadlines={handleUpdateDeadlines}
          canEdit={canEdit}
        />
      </div>

      {/* Judging Criteria */}
      <div className="bg-white rounded-lg border p-4 sm:p-6">
        <JudgingCriteria
          criteria={project.judgingCriteria}
          onUpdateCriteria={handleUpdateCriteria}
          canEdit={canEdit}
        />
      </div>

      {/* Project Stats */}
      <div className="bg-gray-50 rounded-lg border p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{project.teamMembers.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Team Members</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {project.judgingCriteria.filter(c => c.completed).length}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Criteria Addressed</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{project.pivotLog.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Pivots Logged</div>
          </div>
        </div>
      </div>
    </div>
  );
};