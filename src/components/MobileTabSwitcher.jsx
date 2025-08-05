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
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="-mb-px flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors min-h-[48px] touch-manipulation ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 active:bg-gray-50'
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