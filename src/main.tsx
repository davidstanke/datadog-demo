import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { addReactError } from '@datadog/browser-rum-react'
import './datadog-setup' // Import setup to run immediately
import './index.css'
import App from './App.tsx'

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

const root = createRoot(container, {
  onUncaughtError: (error, errorInfo) => {
    // Report uncaught rendering errors to Datadog
    addReactError(error as any, errorInfo);
    console.error('Uncaught error:', error, errorInfo);
  },
  onCaughtError: (error, errorInfo) => {
    // Report caught errors to Datadog (caught by ErrorBoundaries)
    addReactError(error as any, errorInfo);
    console.error('Caught error:', error, errorInfo);
  },
  onRecoverableError: (error, errorInfo) => {
    // Report recoverable hydration/rendering errors to Datadog
    addReactError(error as any, errorInfo);
    console.warn('Recoverable error:', error, errorInfo);
  }
});

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
)

