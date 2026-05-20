import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

const saved = localStorage.getItem('theme') || 'light';
document.documentElement.classList.toggle('dark', saved === 'dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
