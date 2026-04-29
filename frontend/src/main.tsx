import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'

const SPA_ROUTE_PARAM = 'pzm-spa'

function restoreSpaRouteFromFallback() {
  if (typeof window === 'undefined' || window.location.pathname !== '/') {
    return
  }

  const url = new URL(window.location.href)
  const restoredPath = url.searchParams.get(SPA_ROUTE_PARAM)
  if (!restoredPath || !restoredPath.startsWith('/') || restoredPath.startsWith('//')) {
    return
  }

  window.history.replaceState(null, '', restoredPath)
}

restoreSpaRouteFromFallback()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
