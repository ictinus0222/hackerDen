import React from 'react';
import type { ProjectHub as ProjectHubType, TeamMember, JudgingCriterion } from '../types';
import { TeamMemberList } from './TeamMember';
import { DeadlineManager } from './DeadlineManager';
import { JudgingCriteria } from './JudgingCriteria';

interface ProjectHubProps {
  project: ProjectHubType;
  onUpdateProject?: (updates: Partial<ProjectHubType>) => void;
  canEdit?: boolean;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({
  project,
  onUpdateProject,
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

  const handleUpdateBasics = () => {
    if (onUpdateProject) {
      onUpdateProject({
        projectName: editedBasics.projectName,
        oneLineIdea: editedBasics.oneLineIdea
      });
    }
    setIsEditingBasics(false);
  };

  const handleCancelBasics = () => {
    setEditedBasics({
      projectName: project.projectName,
      oneLineIdea: project.oneLineIdea
    });
    setIsEditingBasics(false);
  };

  const handleAddMember = (name: string, role?: string) => {
    if (onUpdateProject) {
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        name,
        role,
        joinedAt: new Date()
      };
      onUpdateProject({
        teamMembers: [...project.teamMembers, newMember]
      });
    }
  };

  const handleRemoveMember = (memberId: string) => {
    if (onUpdateProject) {
      onUpdateProject({
        teamMembers: project.teamMembers.filter(member => member.id !== memberId)
      });
    }
  };

  const handleUpdateDeadlines = (deadlines: ProjectHubType['deadlines']) => {
    if (onUpdateProject) {
      onUpdateProject({ deadlines });
    }
  };

  const handleUpdateCriteria = (criteria: JudgingCriterion[]) => {
    if (onUpdateProject) {
      onUpdateProject({ judgingCriteria: criteria });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Hub</h1>
        <p className="text-gray-600">Your team's central command center</p>
      </div>

      {/* Project Basics */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Vitals</h2>
          {canEdit && !isEditingBasics && (
            <button
              onClick={() => setIsEditingBasics(true)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
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
            <div className="flex space-x-2">
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
      <div className="bg-white rounded-lg border p-6">
        <TeamMemberList
          members={project.teamMembers}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          canManageMembers={canEdit}
        />
      </div>

      {/* Deadlines */}
      <div className="bg-white rounded-lg border p-6">
        <DeadlineManager
          deadlines={project.deadlines}
          onUpdateDeadlines={handleUpdateDeadlines}
          canEdit={canEdit}
        />
      </div>

      {/* Judging Criteria */}
      <div className="bg-white rounded-lg border p-6">
        <JudgingCriteria
          criteria={project.judgingCriteria}
          onUpdateCriteria={handleUpdateCriteria}
          canEdit={canEdit}
        />
      </div>

      {/* Project Stats */}
      <div className="bg-gray-50 rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{project.teamMembers.length}</div>
            <div className="text-sm text-gray-600">Team Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {project.judgingCriteria.filter(c => c.completed).length}
            </div>
            <div className="text-sm text-gray-600">Criteria Addressed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{project.pivotLog.length}</div>
            <div className="text-sm text-gray-600">Pivots Logged</div>
          </div>
        </div>
      </div>
    </div>
  );
};