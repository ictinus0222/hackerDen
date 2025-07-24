import React from 'react';
import type { TeamMember as TeamMemberType } from '../types';

interface TeamMemberProps {
  member: TeamMemberType;
  onRemove?: (memberId: string) => void;
  canRemove?: boolean;
}

export const TeamMember: React.FC<TeamMemberProps> = ({ 
  member, 
  onRemove, 
  canRemove = false 
}) => {
  const handleRemove = () => {
    if (onRemove) {
      onRemove(member.id);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{member.name}</h4>
        {member.role && (
          <p className="text-sm text-gray-600">{member.role}</p>
        )}
        <p className="text-xs text-gray-500">
          Joined {member.joinedAt.toLocaleDateString()}
        </p>
      </div>
      {canRemove && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium"
          aria-label={`Remove ${member.name}`}
        >
          Remove
        </button>
      )}
    </div>
  );
};

interface TeamMemberListProps {
  members: TeamMemberType[];
  onRemoveMember?: (memberId: string) => void;
  onAddMember?: (name: string, role?: string) => void;
  canManageMembers?: boolean;
}

export const TeamMemberList: React.FC<TeamMemberListProps> = ({
  members,
  onRemoveMember,
  onAddMember,
  canManageMembers = false
}) => {
  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState('');
  const [isAddingMember, setIsAddingMember] = React.useState(false);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName.trim() && onAddMember) {
      onAddMember(newMemberName.trim(), newMemberRole.trim() || undefined);
      setNewMemberName('');
      setNewMemberRole('');
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Team Members</h3>
        {canManageMembers && (
          <button
            onClick={() => setIsAddingMember(true)}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add Member
          </button>
        )}
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <TeamMember
            key={member.id}
            member={member}
            onRemove={onRemoveMember}
            canRemove={canManageMembers}
          />
        ))}
      </div>

      {isAddingMember && (
        <form onSubmit={handleAddMember} className="p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-3">
            <div>
              <label htmlFor="memberName" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                id="memberName"
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter member name"
                required
              />
            </div>
            <div>
              <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700">
                Role (optional)
              </label>
              <input
                id="memberRole"
                type="text"
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Frontend Developer, Designer"
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingMember(false);
                  setNewMemberName('');
                  setNewMemberRole('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};