import React from 'react'
import ReactDOM from 'react-dom/client'
// Setup axios interceptors FIRST before any other imports
import '@/setupAxios'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
