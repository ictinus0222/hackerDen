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
    <div className="min-h-screen bg-dark-primary">
      {/* Skip Link for Screen Readers */}
      <a href="#main-content" className="skip-link focus-visible">
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-dark-secondary border-b border-dark-primary shadow-lg" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 rounded bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">H</span>
                </div>
                <h1 className="text-lg font-semibold gradient-text">
                  HackerDen
                </h1>
              </div>
            </div>
            
            <nav className="flex items-center space-x-2 sm:space-x-4" role="navigation" aria-label="User navigation">
              <span 
                className="text-xs sm:text-sm text-dark-secondary hidden sm:block"
                aria-label={`Logged in as ${user?.name}`}
              >
                Welcome, <span className="font-medium text-dark-primary">{user?.name}</span>!
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