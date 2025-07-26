import React from 'react';
import type { JudgingCriterion } from '../types';

interface JudgingCriteriaProps {
  criteria: JudgingCriterion[];
  onUpdateCriteria?: (criteria: JudgingCriterion[]) => void;
  canEdit?: boolean;
}

export const JudgingCriteria: React.FC<JudgingCriteriaProps> = ({
  criteria,
  onUpdateCriteria,
  canEdit = false
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedCriteria, setEditedCriteria] = React.useState<JudgingCriterion[]>(criteria);
  const [newCriterion, setNewCriterion] = React.useState({ name: '', description: '' });

  React.useEffect(() => {
    setEditedCriteria(criteria);
  }, [criteria]);

  const handleToggleComplete = (criterionId: string) => {
    if (!canEdit || isEditing) return;

    const updatedCriteria = criteria.map(criterion =>
      criterion.id === criterionId
        ? { ...criterion, completed: !criterion.completed }
        : criterion
    );

    if (onUpdateCriteria) {
      onUpdateCriteria(updatedCriteria);
    }
  };

  const handleEditCriterion = (criterionId: string, field: 'name' | 'description', value: string) => {
    setEditedCriteria(prev =>
      prev.map(criterion =>
        criterion.id === criterionId
          ? { ...criterion, [field]: value }
          : criterion
      )
    );
  };

  const handleAddCriterion = () => {
    if (newCriterion.name.trim()) {
      const newId = `criterion-${Date.now()}`;
      setEditedCriteria(prev => [
        ...prev,
        {
          id: newId,
          name: newCriterion.name.trim(),
          description: newCriterion.description.trim() || undefined,
          completed: false
        }
      ]);
      setNewCriterion({ name: '', description: '' });
    }
  };

  const handleRemoveCriterion = (criterionId: string) => {
    setEditedCriteria(prev => prev.filter(criterion => criterion.id !== criterionId));
  };

  const handleSave = () => {
    if (onUpdateCriteria) {
      onUpdateCriteria(editedCriteria);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCriteria(criteria);
    setNewCriterion({ name: '', description: '' });
    setIsEditing(false);
  };

  const completedCount = criteria.filter(c => c.completed).length;
  const totalCount = criteria.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">Judging Criteria</h3>
          <p className="text-sm text-gray-600">
            {completedCount} of {totalCount} criteria addressed ({Math.round(completionPercentage)}%)
          </p>
        </div>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 self-start touch-manipulation"
          >
            Edit Criteria
          </button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${completionPercentage}%` }}
        />
      </div>

      {isEditing ? (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          {editedCriteria.map((criterion) => (
            <div key={criterion.id} className="p-3 bg-white rounded border">
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Criterion Name *
                  </label>
                  <input
                    type="text"
                    value={criterion.name}
                    onChange={(e) => handleEditCriterion(criterion.id, 'name', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Business Potential"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description (optional)
                  </label>
                  <textarea
                    value={criterion.description || ''}
                    onChange={(e) => handleEditCriterion(criterion.id, 'description', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                    placeholder="Describe what this criterion means..."
                  />
                </div>
                <button
                  onClick={() => handleRemoveCriterion(criterion.id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Remove Criterion
                </button>
              </div>
            </div>
          ))}

          {/* Add new criterion */}
          <div className="p-3 bg-white rounded border border-dashed border-gray-300">
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  New Criterion Name *
                </label>
                <input
                  type="text"
                  value={newCriterion.name}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Technical Innovation"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description (optional)
                </label>
                <textarea
                  value={newCriterion.description}
                  onChange={(e) => setNewCriterion(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                  placeholder="Describe what this criterion means..."
                />
              </div>
              <button
                onClick={handleAddCriterion}
                disabled={!newCriterion.name.trim()}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Criterion
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm touch-manipulation"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {criteria.map((criterion) => (
            <div
              key={criterion.id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                criterion.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleToggleComplete(criterion.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      criterion.completed
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300'
                    }`}
                  >
                    {criterion.completed && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${criterion.completed ? 'text-green-900' : 'text-gray-900'}`}>
                    {criterion.name}
                  </h4>
                  {criterion.description && (
                    <p className={`text-sm mt-1 ${criterion.completed ? 'text-green-700' : 'text-gray-600'}`}>
                      {criterion.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {criteria.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No judging criteria defined yet.</p>
              {canEdit && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Add some criteria to get started
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};