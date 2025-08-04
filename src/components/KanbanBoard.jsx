import { useTasks } from '../hooks/useTasks';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../hooks/useAuth';
import TaskColumn from './TaskColumn';
import LoadingSpinner from './LoadingSpinner';
import AppwriteSetupGuide from './AppwriteSetupGuide';
import { createTestTasks } from '../utils/testData';

const KanbanBoard = () => {
  const { tasksByStatus, loading, error, refetch } = useTasks();
  const { team } = useTeam();
  const { user } = useAuth();

  const handleCreateTestTasks = async () => {
    if (!team?.$id || !user?.$id) return;
    
    try {
      await createTestTasks(team.$id, user.$id);
      refetch(); // Refresh the tasks
    } catch (error) {
      console.error('Failed to create test tasks:', error);
    }
  };

  const columns = [
    { title: 'To-Do', status: 'todo', tasks: tasksByStatus.todo },
    { title: 'In Progress', status: 'in_progress', tasks: tasksByStatus.in_progress },
    { title: 'Blocked', status: 'blocked', tasks: tasksByStatus.blocked },
    { title: 'Done', status: 'done', tasks: tasksByStatus.done }
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner message="Loading tasks..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h2>
        <div className="h-96 overflow-y-auto">
          <AppwriteSetupGuide error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Kanban Board</h2>
        
        {/* Temporary test button - will be removed in later tasks */}
        <button
          onClick={handleCreateTestTasks}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Test Tasks
        </button>
      </div>
      
      {/* Kanban Columns */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 min-h-0">
        {columns.map((column) => (
          <TaskColumn
            key={column.status}
            title={column.title}
            status={column.status}
            tasks={column.tasks}
            className="min-h-0"
          />
        ))}
      </div>
    </div>
  );
};

export default KanbanBoard;