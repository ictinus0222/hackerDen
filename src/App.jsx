import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { TeamProvider } from './contexts/TeamContext.jsx';
import { ThemeProvider } from './components/ThemeProvider.jsx';
import { FeatureFlagsProvider } from './hooks/useFeatureFlags.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import HackathonWrapper from './components/HackathonWrapper';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OAuthCallbackPage from './pages/OAuthCallbackPage';
import UserHackathonConsole from './pages/UserHackathonConsole';
import CreateHackathonPage from './pages/CreateHackathonPage';
import WhiteboardPage from './pages/WhiteboardPage';
import CardTest from './components/CardTest';
import InputComponentsDemo from './components/InputComponentsDemo';
import MarkdownEditorDemo from './components/MarkdownEditorDemo';
import PublicSubmissionPage from './pages/PublicSubmissionPage';
import FeatureFlagPage from './pages/FeatureFlagPage';
import Home from './components/Home';

import { Toaster } from './components/ui/sonner';

function App() {
  return (
    <ThemeProvider 
      defaultTheme="dark" 
      storageKey="hackerden-theme"
      enableSystem={true}
      disableTransitionOnChange={true}
    >
      <AuthProvider>
        <FeatureFlagsProvider>
          <TeamProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public routes */}
                <Route path="/landing" element={<Navigate to="/home" replace />} />
                <Route path="/home" element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
                <Route path="/submission/:submissionId" element={<PublicSubmissionPage />} />
                
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
                
                {/* Card Test page - temporary for development */}
                <Route 
                  path="/card-test" 
                  element={
                    <ProtectedRoute>
                      <CardTest />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Input Components Demo - temporary for development */}
                <Route 
                  path="/input-demo" 
                  element={
                    <ProtectedRoute>
                      <InputComponentsDemo />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Markdown Editor Demo - temporary for development */}
                <Route 
                  path="/markdown-demo" 
                  element={
                    <ProtectedRoute>
                      <MarkdownEditorDemo />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Feature Flag Management */}
                <Route 
                  path="/feature-flags" 
                  element={
                    <ProtectedRoute>
                      <FeatureFlagPage />
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
                
                {/* Default redirect to home */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/console" replace />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </TeamProvider>
        </FeatureFlagsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
