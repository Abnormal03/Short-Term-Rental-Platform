import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import { ClerkProvider } from "@clerk/clerk-react"

const saved = localStorage.getItem('theme') || 'light';
document.documentElement.classList.toggle('dark', saved === 'dark');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      signUpUrl='/sign-up'
      signInUrl='/sign-in'
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/complete-profile"
      publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)
