import { useState } from 'react';

// Simple time formatting function to avoid external dependency issues
const formatTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  return `${Math.floor(diffInSeconds / 86400)} days ago`;
};

const ProjectOverview = ({ project, commits = [], files = [] }) => {
  const [activeTab, setActiveTab] = useState('code');

  const mockCommits = commits.length > 0 ? commits : [
    {
      id: '1a2b3c4',
      message: 'Add task management functionality',
      author: 'John Doe',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      additions: 45,
      deletions: 12
    },
    {
      id: '5d6e7f8',
      message: 'Fix responsive design issues',
      author: 'Jane Smith',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      additions: 23,
      deletions: 8
    },
    {
      id: '9g0h1i2',
      message: 'Update styling protection tests',
      author: 'Mike Johnson',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      additions: 67,
      deletions: 15
    }
  ];

  const mockFiles = files.length > 0 ? files : [
    { name: 'src/', type: 'folder', lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), message: 'Add task management functionality' },
    { name: 'docs/', type: 'folder', lastModified: new Date(Date.now() - 5 * 60 * 60 * 1000), message: 'Update documentation' },
    { name: 'package.json', type: 'file', lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), message: 'Update dependencies' },
    { name: 'README.md', type: 'file', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Update project description' },
    { name: '.gitignore', type: 'file', lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), message: 'Add build artifacts to gitignore' },
    { name: 'tailwind.config.js', type: 'file', lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), message: 'Configure dark theme' }
  ];

  const getFileIcon = (type, name) => {
    if (type === 'folder') {
      return (
        <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
        </svg>
      );
    }
    
    if (name.endsWith('.md')) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      );
    }
    
    if (name.endsWith('.json')) {
      return (
        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
        </svg>
      );
    }
    
    return (
      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  return (
    <div className="bg-dark-secondary rounded-2xl border border-dark-primary overflow-hidden">
      {/* Header */}
      <div className="bg-dark-tertiary border-b border-dark-primary p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-primary">
                {project?.name || 'HackerDen'}
              </h1>
              <p className="text-sm text-dark-tertiary">
                {project?.description || 'Collaborative task management platform'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
              Active
            </span>
            <button className="btn-secondary text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
              Share
            </button>
            <button className="btn-primary text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Clone
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-dark-tertiary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-dark-secondary">
              <span className="font-mono font-bold text-dark-primary">{mockCommits.length}</span> commits
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-dark-tertiary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
            </svg>
            <span className="text-dark-secondary">
              <span className="font-mono font-bold text-dark-primary">{mockFiles.length}</span> files
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <svg className="w-4 h-4 text-dark-tertiary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-dark-secondary">
              Last updated <span className="font-mono text-dark-primary">
                {formatTimeAgo(mockCommits[0]?.timestamp || new Date())}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-dark-primary">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'code', label: 'Code', icon: 'code' },
            { id: 'commits', label: 'Commits', icon: 'commits' },
            { id: 'activity', label: 'Activity', icon: 'activity' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-dark-tertiary hover:text-dark-secondary hover:border-dark-primary'
              }`}
            >
              {tab.icon === 'code' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
              {tab.icon === 'commits' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {tab.icon === 'activity' && (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'code' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between py-2 px-3 bg-dark-tertiary rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {mockCommits[0]?.author?.charAt(0) || 'U'}
                  </span>
                </div>
                <span className="text-sm text-dark-secondary">
                  <span className="font-medium text-dark-primary">{mockCommits[0]?.author || 'Unknown'}</span>
                  {' '}{mockCommits[0]?.message || 'Latest commit'}
                </span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-dark-tertiary">
                <span className="font-mono">{mockCommits[0]?.id || 'abc123'}</span>
                <span>{formatTimeAgo(mockCommits[0]?.timestamp || new Date())}</span>
              </div>
            </div>

            {mockFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 hover:bg-dark-tertiary rounded-lg transition-colors cursor-pointer group"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type, file.name)}
                  <span className="font-mono text-sm text-dark-primary group-hover:text-blue-400 transition-colors">
                    {file.name}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-dark-tertiary">
                  <span className="truncate max-w-xs">{file.message}</span>
                  <span className="font-mono whitespace-nowrap">
                    {formatTimeAgo(file.lastModified)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="space-y-4">
            {mockCommits.map((commit, index) => (
              <div
                key={commit.id}
                className="flex items-start space-x-4 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-elevated transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-white">
                    {commit.author.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-dark-primary truncate">
                      {commit.message}
                    </h3>
                    <span className="font-mono text-xs text-dark-tertiary bg-dark-secondary px-2 py-1 rounded">
                      {commit.id}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-dark-tertiary">
                    <span>
                      <span className="font-medium text-dark-secondary">{commit.author}</span>
                      {' '}committed {formatTimeAgo(commit.timestamp)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400">+{commit.additions}</span>
                      <span className="text-red-400">-{commit.deletions}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-dark-tertiary mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <h3 className="text-lg font-medium text-dark-primary mb-2">Project Activity</h3>
              <p className="text-dark-tertiary">
                Recent activity and collaboration metrics will appear here
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectOverview;