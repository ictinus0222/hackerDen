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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">HackerDen</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="text-xs sm:text-sm text-gray-700 hidden sm:block">
                Welcome, {user?.name}!
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <span className="sm:hidden">Exit</span>
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:py-6 sm:px-0">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;