import React from 'react';

interface Deadlines {
  hackingEnds: Date;
  submissionDeadline: Date;
  presentationTime: Date;
}

interface DeadlineManagerProps {
  deadlines: Deadlines;
  onUpdateDeadlines?: (deadlines: Deadlines) => void;
  canEdit?: boolean;
}

export const DeadlineManager: React.FC<DeadlineManagerProps> = ({
  deadlines,
  onUpdateDeadlines,
  canEdit = false
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedDeadlines, setEditedDeadlines] = React.useState<Deadlines>(deadlines);

  React.useEffect(() => {
    setEditedDeadlines(deadlines);
  }, [deadlines]);

  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const formatDisplayDate = (date: Date): string => {
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeRemaining = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    if (diff <= 0) {
      return 'Past due';
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  const getUrgencyColor = (date: Date): string => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hoursRemaining = diff / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (hoursRemaining <= 2) {
      return 'text-red-600 bg-red-50 border-red-200';
    } else if (hoursRemaining <= 6) {
      return 'text-orange-600 bg-orange-50 border-orange-200';
    } else {
      return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  const handleSave = () => {
    if (onUpdateDeadlines) {
      onUpdateDeadlines(editedDeadlines);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDeadlines(deadlines);
    setIsEditing(false);
  };

  const handleDateChange = (field: keyof Deadlines, value: string) => {
    setEditedDeadlines(prev => ({
      ...prev,
      [field]: new Date(value)
    }));
  };

  const deadlineItems = [
    {
      key: 'hackingEnds' as keyof Deadlines,
      label: 'Hacking Ends',
      description: 'When development must stop'
    },
    {
      key: 'submissionDeadline' as keyof Deadlines,
      label: 'Submission Deadline',
      description: 'Final submission due'
    },
    {
      key: 'presentationTime' as keyof Deadlines,
      label: 'Presentation Time',
      description: 'When you present to judges'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-gray-900">Key Deadlines</h3>
        {canEdit && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 self-start sm:self-auto touch-manipulation"
          >
            Edit Deadlines
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
          {deadlineItems.map(({ key, label, description }) => (
            <div key={key}>
              <label htmlFor={key} className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <p className="text-xs text-gray-500 mb-1">{description}</p>
              <input
                id={key}
                type="datetime-local"
                value={formatDateTimeLocal(editedDeadlines[key])}
                onChange={(e) => handleDateChange(key, e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm touch-manipulation"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm touch-manipulation"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {deadlineItems.map(({ key, label, description }) => {
            const date = deadlines[key];
            const urgencyColor = getUrgencyColor(date);
            
            return (
              <div key={key} className={`p-3 rounded-lg border ${urgencyColor}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{label}</h4>
                    <p className="text-sm opacity-75">{description}</p>
                    <p className="text-sm font-medium mt-1 break-words">
                      {formatDisplayDate(date)}
                    </p>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <p className="text-sm font-medium">
                      {getTimeRemaining(date)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};