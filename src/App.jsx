import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TeamProvider } from './contexts/TeamContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import HackathonWrapper from './components/HackathonWrapper';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserHackathonConsole from './pages/UserHackathonConsole';
import CreateHackathonPage from './pages/CreateHackathonPage';
import WhiteboardPage from './pages/WhiteboardPage';

function App() {
  return (
    <AuthProvider>
      <TeamProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected routes */}
              {/* Main user console - landing page */}
              <Route 
                path="/console" 
                element={
                  <ProtectedRoute>
                    <UserHackathonConsole />
                  </ProtectedRoute>
                } 
              />
              
              {/* Create hackathon page */}
              <Route 
                path="/create-hackathon" 
                element={
                  <ProtectedRoute>
                    <CreateHackathonPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Whiteboard page */}
              <Route 
                path="/whiteboard" 
                element={
                  <ProtectedRoute>
                    <WhiteboardPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Hackathon workspace with nested routes */}
              <Route 
                path="/hackathon/:hackathonId/*" 
                element={
                  <ProtectedRoute>
                    <HackathonWrapper />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect to console */}
              <Route path="/" element={<Navigate to="/console" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/console" replace />} />
            </Routes>
          </div>
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;
