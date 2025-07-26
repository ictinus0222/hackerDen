import React from 'react';
import type { SubmissionPackage } from '../types';

interface PublicSubmissionPageProps {
  projectName: string;
  oneLineIdea: string;
  teamMembers: Array<{ name: string; role?: string }>;
  submission: SubmissionPackage;
  generatedAt: Date;
}

const PublicSubmissionPage: React.FC<PublicSubmissionPageProps> = ({
  projectName,
  oneLineIdea,
  teamMembers,
  submission,
  generatedAt,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getLinkIcon = (url: string) => {
    if (url.includes('github.com')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM8 9a1 1 0 000 2h4a1 1 0 100-2H8z" />
        </svg>
      );
    }
    
    if (url.includes('vimeo.com')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM8 9a1 1 0 000 2h4a1 1 0 100-2H8z" />
        </svg>
      );
    }
    
    if (url.includes('docs.google.com') || url.includes('slides.google.com')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
    
    // Default link icon
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    );
  };

  const getLinkLabel = (url: string) => {
    if (url.includes('github.com')) return 'View on GitHub';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'Watch on YouTube';
    if (url.includes('vimeo.com')) return 'Watch on Vimeo';
    if (url.includes('docs.google.com') || url.includes('slides.google.com')) return 'View Slides';
    return 'Open Link';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {projectName}
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              {oneLineIdea}
            </p>
            
            {/* Team Members */}
            <div className="flex flex-wrap justify-center gap-4">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-blue-50 px-4 py-2 rounded-full"
                >
                  <span className="text-blue-800 font-medium">
                    {member.name}
                  </span>
                  {member.role && (
                    <span className="text-blue-600 ml-2">
                      ({member.role})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Links */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Project Resources
          </h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* GitHub Repository */}
            {submission.githubUrl && (
              <a
                href={submission.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center mb-3">
                  <div className="text-gray-700 group-hover:text-blue-600">
                    {getLinkIcon(submission.githubUrl)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3 group-hover:text-blue-600">
                    Source Code
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  View the complete source code and documentation
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  {getLinkLabel(submission.githubUrl)}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            )}

            {/* Presentation Slides */}
            {submission.presentationUrl && (
              <a
                href={submission.presentationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center mb-3">
                  <div className="text-gray-700 group-hover:text-blue-600">
                    {getLinkIcon(submission.presentationUrl)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3 group-hover:text-blue-600">
                    Presentation
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  View the project presentation and pitch deck
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  {getLinkLabel(submission.presentationUrl)}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            )}

            {/* Demo Video */}
            {submission.demoVideoUrl && (
              <a
                href={submission.demoVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center mb-3">
                  <div className="text-gray-700 group-hover:text-blue-600">
                    {getLinkIcon(submission.demoVideoUrl)}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 ml-3 group-hover:text-blue-600">
                    Demo Video
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  Watch a demonstration of the project in action
                </p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  {getLinkLabel(submission.demoVideoUrl)}
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            )}
          </div>

          {/* Completion Status */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              {submission.isComplete ? (
                <>
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-700 font-medium">
                    Submission Complete
                  </span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 text-yellow-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-yellow-700 font-medium">
                    Submission In Progress
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>
            Generated on {formatDate(generatedAt)} by hackerDen
          </p>
        </div>
      </div>
    </div>
  );
};export 
default PublicSubmissionPage;