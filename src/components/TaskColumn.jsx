import TaskCard from './TaskCard';

const TaskColumn = ({ title, status, tasks, className = '' }) => {
  const getColumnColor = (status) => {
    switch (status) {
      case 'todo':
        return 'border-gray-300';
      case 'in_progress':
        return 'border-blue-300';
      case 'blocked':
        return 'border-red-300';
      case 'done':
        return 'border-green-300';
      default:
        return 'border-gray-300';
    }
  };

  const getHeaderColor = (status) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-50 text-gray-700';
      case 'in_progress':
        return 'bg-blue-50 text-blue-700';
      case 'blocked':
        return 'bg-red-50 text-red-700';
      case 'done':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Column Header */}
      <div className={`${getHeaderColor(status)} px-4 py-3 rounded-t-lg border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            {title}
          </h3>
          <span className="bg-white bg-opacity-70 text-xs font-medium px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Column Content */}
      <div className={`flex-1 p-4 bg-gray-50 rounded-b-lg border-l border-r border-b ${getColumnColor(status)} min-h-0`}>
        <div className="space-y-3 h-full overflow-y-auto">
          {tasks.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              No tasks in {title.toLowerCase()}
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard key={task.$id} task={task} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskColumn;