import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

const MobileTabSwitcher = ({ children }) => {
  const tabs = [
    { id: 'kanban', label: 'Kanban', component: children[0] },
    { id: 'chat', label: 'Chat', component: children[1] }
  ];

  return (
    <div className="lg:hidden h-full">
      <Tabs defaultValue="kanban" className="h-full flex flex-col">
        {/* Enhanced Tab Navigation with Touch Optimization */}
        <div className="border-b border-border mb-4 sm:mb-6 px-4">
          <TabsList className="w-full h-12 bg-muted/50 p-1">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 h-10 text-sm sm:text-base font-medium touch-manipulation min-h-[44px] data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all duration-200"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content with Proper Height Management */}
        <div className="flex-1 overflow-hidden">
          {tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="h-full m-0 data-[state=active]:flex data-[state=active]:flex-col"
            >
              <div className="h-full overflow-hidden">
                {tab.component}
              </div>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default MobileTabSwitcher;