import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TeamProvider } from './contexts/TeamContext.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProjectPage from './pages/ProjectPage';
import DemoPage from './pages/DemoPage';
import TeamCreationPage from './pages/TeamCreationPage';
import TeamJoinPage from './pages/TeamJoinPage';

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
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/create-team" 
                element={
                  <ProtectedRoute>
                    <TeamCreationPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/join-team" 
                element={
                  <ProtectedRoute>
                    <TeamJoinPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/project/:projectId?" 
                element={
                  <ProtectedRoute>
                    <ProjectPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/demo" 
                element={
                  <ProtectedRoute>
                    <DemoPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </Router>
      </TeamProvider>
    </AuthProvider>
  );
}

export default App;
