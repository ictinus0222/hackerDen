import { useState } from 'react';
import Sidebar from './Sidebar.jsx';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#121C1B' }}>
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden border-b border-gray-700 px-4 py-3 h-14 flex items-center justify-between" style={{ background: '#121C1B' }}>
            <button
              onClick={toggleSidebar}
              className="text-text-secondary hover:text-text-primary p-2 -m-2 rounded-md"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-h1 font-bold text-text-primary">HackerDen</span>
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
          <div className="h-full p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;