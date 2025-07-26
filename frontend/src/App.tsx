import { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ConnectionStatus } from './components/ConnectionStatus'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastProvider } from './hooks/useToast'
import { lazyWithRetry, preloadComponent } from './utils/lazyLoad'
import './App.css'

// Lazy load main components with retry logic
const ProjectHubContainer = lazyWithRetry(() => import('./components/ProjectHubContainer'))
const TaskBoard = lazyWithRetry(() => import('./components/TaskBoard'))
const PivotLog = lazyWithRetry(() => import('./components/PivotLog'))
const SubmissionPackage = lazyWithRetry(() => import('./components/SubmissionPackage'))
const PublicSubmissionPage = lazyWithRetry(() => import('./components/PublicSubmissionPage'))

// Preload critical components
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
          <div className="min-h-screen bg-gray-50">
            <ConnectionStatus />
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<ProjectHubContainer />} />
                <Route path="/project/:id" element={<ProjectHubContainer />} />
                <Route path="/project/:id/tasks" element={<TaskBoard />} />
                <Route path="/project/:id/pivots" element={<PivotLog />} />
                <Route path="/project/:id/submission" element={<SubmissionPackage />} />
                <Route path="/submission/:id/public" element={<PublicSubmissionPage />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export default App