import React, { useState, useEffect } from 'react';
import type { SubmissionPackage } from '../types';

interface SubmissionFormProps {
  projectId: string;
  initialData?: SubmissionPackage | null;
  onSubmit: (data: {
    githubUrl?: string;
    presentationUrl?: string;
    demoVideoUrl?: string;
  }) => Promise<void>;
  isLoading?: boolean;
}

interface FormData {
  githubUrl: string;
  presentationUrl: string;
  demoVideoUrl: string;
}

interface ValidationErrors {
  githubUrl?: string;
  presentationUrl?: string;
  demoVideoUrl?: string;
}

export const SubmissionForm: React.FC<SubmissionFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    githubUrl: '',
    presentationUrl: '',
    demoVideoUrl: '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when initial data changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        githubUrl: initialData.githubUrl || '',
        presentationUrl: initialData.presentationUrl || '',
        demoVideoUrl: initialData.demoVideoUrl || '',
      });
    }
  }, [initialData]);

  // URL validation function
  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return true; // Empty URLs are allowed
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (formData.githubUrl.trim() && !validateUrl(formData.githubUrl.trim())) {
      newErrors.githubUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    if (formData.presentationUrl.trim() && !validateUrl(formData.presentationUrl.trim())) {
      newErrors.presentationUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    if (formData.demoVideoUrl.trim() && !validateUrl(formData.demoVideoUrl.trim())) {
      newErrors.demoVideoUrl = 'Please enter a valid URL (must start with http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Only send non-empty URLs
      const submissionData: {
        githubUrl?: string;
        presentationUrl?: string;
        demoVideoUrl?: string;
      } = {};

      if (formData.githubUrl.trim()) {
        submissionData.githubUrl = formData.githubUrl.trim();
      }
      if (formData.presentationUrl.trim()) {
        submissionData.presentationUrl = formData.presentationUrl.trim();
      }
      if (formData.demoVideoUrl.trim()) {
        submissionData.demoVideoUrl = formData.demoVideoUrl.trim();
      }

      await onSubmit(submissionData);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate completion status
  const getCompletionStatus = () => {
    const requiredFields = ['githubUrl', 'presentationUrl'];
    const completedFields = requiredFields.filter(field => 
      formData[field as keyof FormData]?.trim()
    );
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100),
      isComplete: completedFields.length === requiredFields.length
    };
  };

  const completionStatus = getCompletionStatus();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Submission Package</h2>
        <p className="text-sm sm:text-base text-gray-600">
          Prepare your final submission with all the necessary links and information.
        </p>
        
        {/* Completion Status */}
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-1">
            <span className="text-sm font-medium text-gray-700">
              Completion Status
            </span>
            <span className="text-sm text-gray-600">
              {completionStatus.completed}/{completionStatus.total} required fields
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                completionStatus.isComplete ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${completionStatus.percentage}%` }}
            />
          </div>
          {completionStatus.isComplete && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Ready for submission!
            </p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* GitHub Repository URL */}
        <div>
          <label htmlFor="githubUrl" className="block text-sm font-medium text-gray-700 mb-2">
            GitHub Repository URL *
          </label>
          <input
            type="url"
            id="githubUrl"
            value={formData.githubUrl}
            onChange={(e) => handleInputChange('githubUrl', e.target.value)}
            placeholder="https://github.com/username/repository"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.githubUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.githubUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.githubUrl}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Link to your project's source code repository
          </p>
        </div>

        {/* Presentation Slides URL */}
        <div>
          <label htmlFor="presentationUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Presentation Slides URL *
          </label>
          <input
            type="url"
            id="presentationUrl"
            value={formData.presentationUrl}
            onChange={(e) => handleInputChange('presentationUrl', e.target.value)}
            placeholder="https://docs.google.com/presentation/d/..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.presentationUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.presentationUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.presentationUrl}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Link to your presentation slides (Google Slides, PowerPoint Online, etc.)
          </p>
        </div>

        {/* Demo Video URL */}
        <div>
          <label htmlFor="demoVideoUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Demo Video URL
          </label>
          <input
            type="url"
            id="demoVideoUrl"
            value={formData.demoVideoUrl}
            onChange={(e) => handleInputChange('demoVideoUrl', e.target.value)}
            placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.demoVideoUrl ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading || isSubmitting}
          />
          {errors.demoVideoUrl && (
            <p className="mt-1 text-sm text-red-600">{errors.demoVideoUrl}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Optional: Link to a demo video of your project
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-4 gap-3">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            * Required fields
          </p>
          <button
            type="submit"
            disabled={isLoading || isSubmitting}
            className={`px-4 sm:px-6 py-2 rounded-md font-medium transition-colors touch-manipulation order-1 sm:order-2 ${
              isLoading || isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
            } text-white text-sm sm:text-base`}
          >
            {isSubmitting ? 'Saving...' : 'Save Submission Package'}
          </button>
        </div>
      </form>
    </div>
  );
};