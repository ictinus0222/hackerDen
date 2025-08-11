import { useState } from 'react';
import Layout from '../components/Layout.jsx';
import KanbanBoard from '../components/KanbanBoard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import { useTeam } from '../hooks/useTeam.jsx';

const TasksPage = () => {
  const { team, hasTeam } = useTeam();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskCreated = () => {
    // Task creation is handled by the modal and real-time updates
    // No need to manually refresh as the KanbanBoard uses real-time data
  };

  if (!hasTeam) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <div className="text-center">
            <svg className="w-16 h-16 text-dark-tertiary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-dark-primary mb-2">No Team Found</h3>
            <p className="text-dark-tertiary mb-4">You need to join or create a team to manage tasks.</p>
            <div className="space-x-3">
              <a href="/create-team" className="btn-primary">
                Create Team
              </a>
              <a href="/join-team" className="btn-secondary">
                Join Team
              </a>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ErrorBoundary>
        <div className="h-full flex flex-col">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-dark-primary">Task Management</h1>
              <p className="text-dark-tertiary">
                Manage your team's tasks and track progress
              </p>
            </div>
            
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Task</span>
            </button>
          </div>

          {/* Full-Screen Kanban Board */}
          <div className="flex-1 min-h-0">
            <KanbanBoard />
          </div>

          {/* Task Creation Modal */}
          <TaskModal
            isOpen={isTaskModalOpen}
            onClose={() => setIsTaskModalOpen(false)}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      </ErrorBoundary>
    </Layout>
  );
};

export default TasksPage;