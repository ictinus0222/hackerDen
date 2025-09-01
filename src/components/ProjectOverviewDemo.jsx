import { useState } from 'react';
import ProjectOverview from './ProjectOverview.jsx';
import { EnhancedCard } from './ui/card';

const ProjectOverviewDemo = () => {
  const [selectedDemo, setSelectedDemo] = useState('default');

  const demoProjects = {
    default: {
      name: 'HackerDen MVP',
      description: 'Collaborative task management platform with real-time features',
      commits: [
        {
          id: 'a1b2c3d',
          message: 'Implement styling protection tests',
          author: 'Sarah Chen',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          additions: 127,
          deletions: 23
        },
        {
          id: 'e4f5g6h',
          message: 'Add visual regression testing',
          author: 'Mike Rodriguez',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
          additions: 89,
          deletions: 12
        },
        {
          id: 'i7j8k9l',
          message: 'Fix responsive design issues on mobile',
          author: 'Alex Kim',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          additions: 45,
          deletions: 31
        },
        {
          id: 'm0n1o2p',
          message: 'Update component snapshots',
          author: 'Jordan Taylor',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
          additions: 67,
          deletions: 8
        },
        {
          id: 'q3r4s5t',
          message: 'Enhance dark theme consistency',
          author: 'Casey Morgan',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          additions: 34,
          deletions: 19
        }
      ],
      files: [
        { name: 'src/', type: 'folder', lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000), message: 'Add styling protection utilities' },
        { name: 'components/', type: 'folder', lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), message: 'Update ProjectOverview component' },
        { name: 'pages/', type: 'folder', lastModified: new Date(Date.now() - 3 * 60 * 60 * 1000), message: 'Add ProjectPage with GitHub-style UI' },
        { name: '__tests__/', type: 'folder', lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000), message: 'Comprehensive styling protection tests' },
        { name: 'docs/', type: 'folder', lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), message: 'Update task completion documentation' },
        { name: 'package.json', type: 'file', lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), message: 'Add date-fns dependency' },
        { name: 'README.md', type: 'file', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Update project description and features' },
        { name: 'tailwind.config.js', type: 'file', lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), message: 'Configure dark theme colors' },
        { name: 'vitest.config.js', type: 'file', lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), message: 'Setup test environment' },
        { name: '.gitignore', type: 'file', lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), message: 'Add test coverage to gitignore' }
      ]
    },
    minimal: {
      name: 'Starter Project',
      description: 'A minimal project template for quick prototyping',
      commits: [
        {
          id: 'x1y2z3a',
          message: 'Initial project setup',
          author: 'Dev Team',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          additions: 156,
          deletions: 0
        },
        {
          id: 'b4c5d6e',
          message: 'Add basic components',
          author: 'Dev Team',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          additions: 78,
          deletions: 5
        }
      ],
      files: [
        { name: 'src/', type: 'folder', lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), message: 'Add basic components' },
        { name: 'public/', type: 'folder', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Initial project setup' },
        { name: 'package.json', type: 'file', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Initial project setup' },
        { name: 'README.md', type: 'file', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Initial project setup' }
      ]
    }
  };

  return (
    <div className="space-y-6">
      {/* Demo Controls */}
      <EnhancedCard className="p-4">
        <h3 className="text-lg font-semibold text-dark-primary mb-4">
          GitHub-Inspired Project Overview Demo
        </h3>
        <p className="text-dark-secondary mb-4">
          This component provides a GitHub-style interface for viewing project details, 
          commit history, and file structure. Switch between different demo configurations below.
        </p>
        
        <div className="flex flex-wrap gap-2">
          {Object.keys(demoProjects).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedDemo(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedDemo === key
                  ? 'bg-blue-500 text-white'
                  : 'bg-dark-tertiary text-dark-secondary hover:bg-dark-elevated hover:text-dark-primary'
              }`}
            >
              {key === 'default' ? 'Full Project' : 'Minimal Project'}
            </button>
          ))}
        </div>
      </EnhancedCard>

      {/* Project Overview Component */}
      <ProjectOverview 
        project={demoProjects[selectedDemo]}
        commits={demoProjects[selectedDemo].commits}
        files={demoProjects[selectedDemo].files}
      />

      {/* Feature Highlights */}
      <div className="card-enhanced rounded-xl p-6">
        <h3 className="text-lg font-semibold text-dark-primary mb-4">Key Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">Tabbed Navigation</h4>
                <p className="text-sm text-dark-tertiary">Switch between code, commits, and activity views</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">File Browser</h4>
                <p className="text-sm text-dark-tertiary">Browse project files with icons and metadata</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">Commit History</h4>
                <p className="text-sm text-dark-tertiary">View detailed commit information with stats</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">Dark Theme</h4>
                <p className="text-sm text-dark-tertiary">Consistent with HackerDen's dark theme design</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">Project Stats</h4>
                <p className="text-sm text-dark-tertiary">Display commit count, file count, and activity</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-dark-primary">Responsive Design</h4>
                <p className="text-sm text-dark-tertiary">Works seamlessly on mobile and desktop</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewDemo;