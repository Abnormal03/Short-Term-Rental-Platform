import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import queryClient from './lib/queryClient'

import "./App.css"
import { useAxiosAuth } from './hooks/useAxiosHook'
import AppRoutes from './routes/AppRoutes'
import AuthSync from './components/auth/AuthSync'

function App() {
  useAxiosAuth();
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthSync />
        <AppRoutes />
      </QueryClientProvider>
    </BrowserRouter>
  )
}

export default App