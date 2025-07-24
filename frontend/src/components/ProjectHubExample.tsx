import React from 'react';
import { ProjectHubContainer } from './ProjectHubContainer';
import type { ProjectHub } from '../types';

// Example component showing how to use the ProjectHubContainer
export const ProjectHubExample: React.FC = () => {
  // Example project data
  const exampleProject: ProjectHub = {
    projectId: 'example-project-1',
    projectName: 'HackerDen MVP',
    oneLineIdea: 'A focused hackathon management tool that streamlines team workflows from formation to submission.',
    teamMembers: [
      {
        id: 'member-1',
        name: 'Alice Johnson',
        role: 'Team Lead',
        joinedAt: new Date('2024-01-15T10:00:00Z')
      },
      {
        id: 'member-2',
        name: 'Bob Smith',
        role: 'Full Stack Developer',
        joinedAt: new Date('2024-01-15T10:30:00Z')
      },
      {
        id: 'member-3',
        name: 'Carol Davis',
        role: 'UI/UX Designer',
        joinedAt: new Date('2024-01-15T11:00:00Z')
      }
    ],
    deadlines: {
      hackingEnds: new Date('2024-01-20T18:00:00Z'),
      submissionDeadline: new Date('2024-01-20T20:00:00Z'),
      presentationTime: new Date('2024-01-21T09:00:00Z')
    },
    judgingCriteria: [
      {
        id: 'criteria-1',
        name: 'Business Potential',
        description: 'How viable is this as a business opportunity?',
        completed: true
      },
      {
        id: 'criteria-2',
        name: 'User Experience',
        description: 'How intuitive and user-friendly is the solution?',
        completed: true
      },
      {
        id: 'criteria-3',
        name: 'Technical Implementation',
        description: 'How well is the solution technically executed?',
        completed: false
      },
      {
        id: 'criteria-4',
        name: 'Innovation',
        description: 'How creative and original is the approach?',
        completed: false
      }
    ],
    pivotLog: [
      {
        id: 'pivot-1',
        description: 'Switched from general project management to hackathon-specific tool',
        reason: 'Market research showed hackathon teams have unique needs not addressed by existing tools',
        timestamp: new Date('2024-01-16T14:30:00Z')
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Project Hub Demo
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This demonstrates the Project Hub component with full API integration. 
              In a real application, this would load project data from the backend 
              and allow real-time collaboration.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">✅ Implemented</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• API service functions for all project operations</li>
                  <li>• Form submission handling with validation</li>
                  <li>• Error handling and loading states</li>
                  <li>• Success feedback for user actions</li>
                  <li>• Integration tests for API interactions</li>
                  <li>• Real-time project updates</li>
                  <li>• Team member management</li>
                  <li>• Deadline tracking</li>
                  <li>• Judging criteria management</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">🔄 API Operations</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Create new projects</li>
                  <li>• Load project by ID</li>
                  <li>• Update project information</li>
                  <li>• Add team members</li>
                  <li>• Remove team members</li>
                  <li>• JWT token management</li>
                  <li>• Error handling with user feedback</li>
                  <li>• Loading states during operations</li>
                </ul>
              </div>
            </div>
          </div>

          <ProjectHubContainer 
            initialProject={exampleProject}
            canEdit={true}
          />
        </div>
      </div>
    </div>
  );
};