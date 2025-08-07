import { useAuth } from '../hooks/useAuth.jsx';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">H</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  HackerDen
                </h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-4" role="navigation" aria-label="User navigation">
              <a 
                href="/demo"
                className="btn btn-secondary text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Demo
              </a>
              <span 
                className="text-sm text-gray-600 hidden sm:block"
                aria-label={`Logged in as ${user?.name}`}
              >
                Welcome, <span className="font-medium text-gray-900">{user?.name}</span>!
              </span>
              
              <button
                onClick={handleLogout}
                className="text-white px-4 py-2 sm:px-5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] touch-manipulation btn-danger"
                aria-label="Sign out of your account"
                type="button"
              >
                <span className="sm:hidden" aria-hidden="true">Exit</span>
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        id="main-content"
        className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8"
        role="main"
        tabIndex="-1"
      >
        <div className="px-4 py-4 sm:py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;