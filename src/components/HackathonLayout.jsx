import { useState } from 'react';
import { useParams } from 'react-router-dom';
import BreadcrumbNavigation from './BreadcrumbNavigation.jsx';
import HackathonSidebar from './HackathonSidebar.jsx';
import { useAuth } from '../hooks/useAuth';
import { useHackathonTeam } from '../hooks/useHackathonTeam';
import { useHackathonTasks } from '../hooks/useHackathonTasks';

const HackathonLayout = ({ children, hackathon }) => {
  const { hackathonId } = useParams();
  const { team } = useHackathonTeam(hackathonId);
  const { tasksByStatus } = useHackathonTasks();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Floating Hackathon Sidebar */}
      <HackathonSidebar 
        isOpen={isSidebarOpen} 
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        hackathon={hackathon}
        team={team}
        tasksByStatus={tasksByStatus}
        hackathonId={hackathonId}
      />

      {/* Main Content Area */}
      <div className="lg:ml-80">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-border px-4 py-3 h-14 flex items-center justify-between bg-background">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-lg font-bold text-foreground">HackerDen</span>
          </div>
          
          <div className="w-10"></div> {/* Spacer for centering */}
        </header>

        {/* Breadcrumb Navigation */}
        <div className="border-b border-border bg-background/95 backdrop-blur-sm px-4 lg:px-6 py-3">
          <BreadcrumbNavigation hackathon={hackathon} />
        </div>

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-hidden"
          role="main"
          tabIndex="-1"
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default HackathonLayout;