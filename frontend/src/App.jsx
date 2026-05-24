import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'

import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react"

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>

      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App