import React, { useState } from 'react';
import type { PivotEntry } from '../types';

interface PivotFormProps {
  onSubmit: (pivot: { description: string; reason: string }) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
}

export const PivotForm: React.FC<PivotFormProps> = ({
  onSubmit,
  isLoading = false,
  onCancel
}) => {
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ description?: string; reason?: string }>({});
  const [internalLoading, setInternalLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: { description?: string; reason?: string } = {};

    if (!description.trim()) {
      newErrors.description = 'Pivot description is required';
    } else if (description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    if (!reason.trim()) {
      newErrors.reason = 'Pivot reason is required';
    } else if (reason.length > 1000) {
      newErrors.reason = 'Reason must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setInternalLoading(true);
    try {
      await onSubmit({
        description: description.trim(),
        reason: reason.trim()
      });
      
      // Reset form on successful submission
      setDescription('');
      setReason('');
      setErrors({});
    } catch (error) {
      console.error('Failed to log pivot:', error);
      // Don't reset form on error so user can retry
    } finally {
      setInternalLoading(false);
    }
  };

  const handleCancel = () => {
    setDescription('');
    setReason('');
    setErrors({});
    onCancel?.();
  };

  const currentlyLoading = isLoading || internalLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pivot-description" className="block text-sm font-medium text-gray-700 mb-1">
          What changed?
        </label>
        <textarea
          id="pivot-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the pivot or direction change..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          maxLength={1000}
          disabled={currentlyLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {description.length}/1000 characters
        </p>
      </div>

      <div>
        <label htmlFor="pivot-reason" className="block text-sm font-medium text-gray-700 mb-1">
          Why did you pivot?
        </label>
        <textarea
          id="pivot-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Explain the reasoning behind this change..."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.reason ? 'border-red-500' : 'border-gray-300'
          }`}
          rows={3}
          maxLength={1000}
          disabled={currentlyLoading}
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {reason.length}/1000 characters
        </p>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={currentlyLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={currentlyLoading || !description.trim() || !reason.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {currentlyLoading ? 'Logging Pivot...' : 'Log Pivot'}
        </button>
      </div>
    </form>
  );
};