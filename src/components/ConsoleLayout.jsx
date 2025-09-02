import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import BreadcrumbNavigation from './BreadcrumbNavigation.jsx';

const ConsoleLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

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

        {/* Main Content */}
        <main 
          id="main-content"
          className="flex-1 overflow-hidden"
          role="main"
          tabIndex="-1"
        >
          <div className="h-full p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Breadcrumb Navigation */}
              <BreadcrumbNavigation alwaysShow={true} className="text-sm" />
              
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ConsoleLayout;