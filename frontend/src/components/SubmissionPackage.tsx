import React, { useState, useEffect } from 'react';
import { SubmissionForm } from './SubmissionForm';
import { submissionApi } from '../services/api';
import type { SubmissionPackage as SubmissionPackageType } from '../types';

interface SubmissionPackageProps {
  projectId: string;
}

export const SubmissionPackage: React.FC<SubmissionPackageProps> = ({
  projectId,
}) => {
  const [submission, setSubmission] = useState<SubmissionPackageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing submission data
  useEffect(() => {
    const loadSubmission = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const data = await submissionApi.getByProject(projectId);
        setSubmission(data);
      } catch (err) {
        console.error('Failed to load submission:', err);
        setError('Failed to load submission data');
      } finally {
        setIsLoading(false);
      }
    };

    if (projectId) {
      loadSubmission();
    }
  }, [projectId]);

  // Handle form submission
  const handleSubmit = async (data: {
    githubUrl?: string;
    presentationUrl?: string;
    demoVideoUrl?: string;
  }) => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      const updatedSubmission = await submissionApi.createOrUpdate(projectId, data);
      setSubmission(updatedSubmission);
      setSuccessMessage('Submission package saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to save submission:', err);
      setError(err.message || 'Failed to save submission package');
    }
  };

  // Generate public submission page URL
  const getPublicUrl = () => {
    if (!submission?.generatedPageUrl) return null;
    return submission.generatedPageUrl;
  };

  // Copy public URL to clipboard
  const copyPublicUrl = async () => {
    const url = getPublicUrl();
    if (!url) return;
    
    try {
      await navigator.clipboard.writeText(url);
      setSuccessMessage('Public URL copied to clipboard!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      setError('Failed to copy URL to clipboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading submission data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submission Form */}
      <SubmissionForm
        projectId={projectId}
        initialData={submission}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />

      {/* Public Submission Page Section */}
      {submission && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Public Submission Page
          </h3>
          
          <p className="text-gray-600 mb-4">
            Share this link with judges and organizers to showcase your project:
          </p>
          
          {getPublicUrl() ? (
            <div className="space-y-4">
              {/* URL Display */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={getPublicUrl()!}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm"
                />
                <button
                  onClick={copyPublicUrl}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm font-medium"
                >
                  Copy
                </button>
                <a
                  href={getPublicUrl()!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-sm font-medium"
                >
                  Preview
                </a>
              </div>
              
              {/* Submission Status */}
              <div className="flex items-center space-x-2 text-sm">
                {submission.isComplete ? (
                  <>
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-green-700 font-medium">
                      Ready for submission
                    </span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-yellow-700 font-medium">
                      Incomplete - add required links above
                    </span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              Save your submission package to generate a public URL
            </div>
          )}
        </div>
      )}
    </div>
  );
};