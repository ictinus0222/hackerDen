import { useState } from 'react';

const MobileTabSwitcher = ({ children }) => {
  const [activeTab, setActiveTab] = useState('kanban');

  const tabs = [
    { id: 'kanban', label: 'Kanban', component: children[0] },
    { id: 'chat', label: 'Chat', component: children[1] }
  ];

  return (
    <div className="lg:hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="h-full">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default MobileTabSwitcher;