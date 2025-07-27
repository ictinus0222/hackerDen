import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConnectionStatus } from './components/ConnectionStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './hooks/useToast'
import { ProjectLayout } from './components/ProjectLayout'
import { lazyWithRetry, preloadComponent } from './utils/lazyLoad'
import './App.css'

// Lazy load main components with retry logic
const HomePage = lazyWithRetry(() => import('./components/HomePage'))
const ProjectHubContainer = lazyWithRetry(() => import('./components/ProjectHubContainer'))
const TaskBoard = lazyWithRetry(() => import('./components/TaskBoard'))
const PivotLog = lazyWithRetry(() => import('./components/PivotLog'))
const SubmissionPackage = lazyWithRetry(() => import('./components/SubmissionPackage'))
const PublicSubmissionPage = lazyWithRetry(() => import('./components/PublicSubmissionPage'))

// Preload critical components
preloadComponent(() => import('./components/HomePage'))
preloadComponent(() => import('./components/ProjectHubContainer'))
preloadComponent(() => import('./components/TaskBoard'))

// Loading component for suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3 text-gray-600">Loading...</span>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider position="top-right">
        <Router>
          <ConnectionStatus />
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Home page for project creation/joining */}
              <Route path="/" element={<HomePage />} />
              
              {/* Public submission page (no auth required) */}
              <Route path="/submission/:id/public" element={<PublicSubmissionPage />} />
              
              {/* Protected project routes with navigation */}
              <Route path="/project/:id" element={
                <ProjectLayout>
                  <ProjectHubContainer />
                </ProjectLayout>
              } />
              <Route path="/project/:id/tasks" element={
                <ProjectLayout>
                  <TaskBoard />
                </ProjectLayout>
              } />
              <Route path="/project/:id/pivots" element={
                <ProjectLayout>
                  <PivotLog />
                </ProjectLayout>
              } />
              <Route path="/project/:id/submission" element={
                <ProjectLayout>
                  <SubmissionPackage />
                </ProjectLayout>
              } />
              
              {/* Catch-all route */}
              <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
                    <p className="text-gray-600 mb-4">The page you're looking for doesn't exist.</p>
                    <a href="/" className="text-blue-600 hover:text-blue-800 underline">
                      Go to Home
                    </a>
                  </div>
                </div>
              } />
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App