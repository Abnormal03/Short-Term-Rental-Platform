import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { applyTheme, getSavedTheme } from './constants/colors'

import { ClerkProvider } from "@clerk/clerk-react"

applyTheme(getSavedTheme());

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
