import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProjectOverview from '../components/ProjectOverview.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { useTeam } from '../hooks/useTeam.jsx';
import { useTasks } from '../hooks/useTasks.jsx';

const ProjectPage = () => {
  const { projectId } = useParams();
  const { team, loading: teamLoading, hasTeam } = useTeam();
  const { tasksByStatus, loading: tasksLoading } = useTasks();
  const [projectData, setProjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load project data once when component mounts and dependencies are ready
  useEffect(() => {
    const loadProjectData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Wait for team and tasks to be loaded
        if (teamLoading || tasksLoading) {
          return;
        }
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate project data
        const allTasks = tasksByStatus ? Object.values(tasksByStatus).flat() : [];
        const recentCommits = allTasks.length > 0 ? allTasks.slice(0, 5).map((task, index) => ({
          id: `${task.$id?.slice(0, 7) || Math.random().toString(36).slice(2, 9)}`,
          message: `${task.status === 'done' ? 'Complete' : 'Update'}: ${task.title}`,
          author: task.assigned_to || 'Team Member',
          timestamp: new Date(task.$updatedAt || Date.now() - index * 2 * 60 * 60 * 1000),
          additions: Math.floor(Math.random() * 50) + 10,
          deletions: Math.floor(Math.random() * 20) + 2
        })) : [
          {
            id: 'abc123d',
            message: 'Initial project setup',
            author: 'Development Team',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            additions: 156,
            deletions: 0
          },
          {
            id: 'def456g',
            message: 'Add GitHub-inspired UI components',
            author: 'UI Team',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
            additions: 89,
            deletions: 12
          },
          {
            id: 'hij789k',
            message: 'Implement real-time synchronization',
            author: 'Backend Team',
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            additions: 234,
            deletions: 45
          }
        ];

        const projectFiles = [
          { name: 'src/', type: 'folder', lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), message: 'Add new components' },
          { name: 'components/', type: 'folder', lastModified: new Date(Date.now() - 4 * 60 * 60 * 1000), message: 'Update UI components' },
          { name: 'pages/', type: 'folder', lastModified: new Date(Date.now() - 3 * 60 * 60 * 1000), message: 'Add project pages' },
          { name: 'hooks/', type: 'folder', lastModified: new Date(Date.now() - 5 * 60 * 60 * 1000), message: 'Custom React hooks' },
          { name: 'services/', type: 'folder', lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), message: 'API service layer' },
          { name: 'docs/', type: 'folder', lastModified: new Date(Date.now() - 6 * 60 * 60 * 1000), message: 'Update documentation' },
          { name: 'package.json', type: 'file', lastModified: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), message: 'Update dependencies' },
          { name: 'README.md', type: 'file', lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), message: 'Update project description' },
          { name: 'tailwind.config.js', type: 'file', lastModified: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), message: 'Configure styling' },
          { name: 'vite.config.js', type: 'file', lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), message: 'Build configuration' },
          { name: '.env.example', type: 'file', lastModified: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), message: 'Add environment template' },
          { name: '.gitignore', type: 'file', lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), message: 'Update ignore patterns' }
        ];

        setProjectData({
          id: projectId || 'hackerden-main',
          name: (hasTeam && team?.name) ? `${team.name} Project` : 'HackerDen Project',
          description: 'Collaborative task management and project tracking platform with real-time synchronization',
          commits: recentCommits,
          files: projectFiles,
          stats: {
            totalTasks: allTasks.length,
            completedTasks: tasksByStatus?.done?.length || 0,
            activeTasks: (tasksByStatus?.todo?.length || 0) + (tasksByStatus?.in_progress?.length || 0),
            blockedTasks: tasksByStatus?.blocked?.length || 0
          }
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error loading project data:', err);
        setError('Failed to load project data');
        setLoading(false);
      }
    };

    loadProjectData();
  }, [projectId, team?.$id, hasTeam]);

  // Update project stats when tasks change (without reloading everything)
  useEffect(() => {
    if (tasksByStatus && !loading) {
      const allTasks = Object.values(tasksByStatus).flat();
      setProjectData(prev => {
        if (!prev) return prev;
        
        const newStats = {
          totalTasks: allTasks.length,
          completedTasks: tasksByStatus?.done?.length || 0,
          activeTasks: (tasksByStatus?.todo?.length || 0) + (tasksByStatus?.in_progress?.length || 0),
          blockedTasks: tasksByStatus?.blocked?.length || 0
        };
        
        // Only update if stats actually changed to prevent unnecessary re-renders
        if (JSON.stringify(prev.stats) === JSON.stringify(newStats)) {
          return prev;
        }
        
        return {
          ...prev,
          stats: newStats
        };
      });
    }
  }, [tasksByStatus, loading]);

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <LoadingSpinner message="Loading project details..." />
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (error && !projectData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
            <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Project</h3>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="btn-primary text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorBoundary>
        <div className="space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-dark-tertiary">
            <a href="/dashboard" className="hover:text-dark-secondary transition-colors">
              Dashboard
            </a>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-dark-primary font-medium">
              {projectData?.name || 'Project'}
            </span>
          </nav>

          {/* Project Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-enhanced rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Total Tasks</p>
                  <p className="text-2xl font-bold text-dark-primary">
                    {projectData?.stats?.totalTasks || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-enhanced rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Completed</p>
                  <p className="text-2xl font-bold text-green-400">
                    {projectData?.stats?.completedTasks || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-enhanced rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Active</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {projectData?.stats?.activeTasks || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="card-enhanced rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-dark-tertiary">Blocked</p>
                  <p className="text-2xl font-bold text-red-400">
                    {projectData?.stats?.blockedTasks || 0}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Project Overview */}
          <ProjectOverview 
            project={projectData}
            commits={projectData?.commits || []}
            files={projectData?.files || []}
          />

          {/* Quick Actions */}
          <div className="card-enhanced rounded-xl p-6">
            <h3 className="text-lg font-semibold text-dark-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-elevated transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-dark-primary">Create Task</h4>
                  <p className="text-sm text-dark-tertiary">Add a new task to the project</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-elevated transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-dark-primary">Sync Changes</h4>
                  <p className="text-sm text-dark-tertiary">Pull latest updates from team</p>
                </div>
              </button>

              <button className="flex items-center space-x-3 p-4 bg-dark-tertiary rounded-xl hover:bg-dark-elevated transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2v1a2 2 0 002 2h4a2 2 0 002-2V3a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-dark-primary">View Reports</h4>
                  <p className="text-sm text-dark-tertiary">Generate project analytics</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default ProjectPage;