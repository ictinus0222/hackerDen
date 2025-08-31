import { useState } from 'react';
import { Button } from './ui/button';

const MobileTabSwitcher = ({ children }) => {
  const [activeTab, setActiveTab] = useState('kanban');

  const tabs = [
    { id: 'kanban', label: 'Kanban', component: children[0] },
    { id: 'chat', label: 'Chat', component: children[1] }
  ];

  return (
    <div className="lg:hidden">
      {/* Tab Navigation */}
      <div className="border-b border-border mb-4 sm:mb-6">
        <nav className="-mb-px flex">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 border-b-2 font-medium text-sm sm:text-base transition-colors min-h-[48px] rounded-none ${
                activeTab === tab.id
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              {tab.label}
            </Button>
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