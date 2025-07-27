import React, { useState, useEffect } from 'react';
import type { PivotEntry } from '../types';
import { PivotForm } from './PivotForm';
import { pivotApi } from '../services/api';

interface PivotLogProps {
  projectId: string;
  initialPivots?: PivotEntry[];
  onPivotAdded?: (pivot: PivotEntry) => void;
}

const PivotLog: React.FC<PivotLogProps> = ({
  projectId,
  initialPivots = [],
  onPivotAdded
}) => {
  const [pivots, setPivots] = useState<PivotEntry[]>(initialPivots);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load pivots if not provided initially
  useEffect(() => {
    if (initialPivots.length === 0 && pivots.length === 0) {
      loadPivots();
    }
  }, [projectId]);

  const loadPivots = async () => {
    try {
      setError(null);
      const fetchedPivots = await pivotApi.getByProject(projectId);
      setPivots(fetchedPivots);
    } catch (err) {
      console.error('Failed to load pivots:', err);
      setError('Failed to load pivot history');
    }
  };

  const handleAddPivot = async (pivotData: { description: string; reason: string }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newPivot = await pivotApi.create(projectId, pivotData);
      
      // Add to local state (API returns pivots sorted by timestamp)
      setPivots(prev => [newPivot, ...prev]);
      setShowForm(false);
      
      // Notify parent component
      onPivotAdded?.(newPivot);
    } catch (err) {
      console.error('Failed to add pivot:', err);
      setError(err instanceof Error ? err.message : 'Failed to log pivot');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: Date): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Pivot Log</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 self-start sm:self-auto touch-manipulation"
        >
          {showForm ? 'Hide Form' : 'Log Pivot'}
        </button>
      </div>

      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      {showForm && (
        <div className="p-3 sm:p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-md font-medium text-gray-900 mb-3">Log a New Pivot</h4>
          <PivotForm
            onSubmit={handleAddPivot}
            isLoading={isLoading}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-3">
        {pivots.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🔄</div>
            <p className="text-sm">No pivots logged yet</p>
            <p className="text-xs text-gray-400 mt-1">
              Track major direction changes and decisions here
            </p>
          </div>
        ) : (
          pivots.map((pivot) => (
            <div
              key={pivot.id}
              className="p-3 sm:p-4 bg-white border border-gray-200 rounded-md shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🔄</span>
                  <span className="text-xs text-gray-500 font-medium">
                    {formatTimestamp(pivot.timestamp)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">What changed:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {pivot.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Why:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed break-words">
                    {pivot.reason}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {pivots.length > 0 && (
        <div className="text-center">
          <p className="text-xs text-gray-400">
            {pivots.length} pivot{pivots.length === 1 ? '' : 's'} logged
          </p>
        </div>
      )}
    </div>
  );
};

export default PivotLog;