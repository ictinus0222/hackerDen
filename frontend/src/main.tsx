import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from './utils/serviceWorker'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register service worker for offline support
registerSW({
  onSuccess: () => {
    console.log('App is ready for offline use')
  },
  onUpdate: () => {
    console.log('New app version available')
    // You could show a toast notification here
  },
  onOfflineReady: () => {
    console.log('App is ready to work offline')
  }
})
