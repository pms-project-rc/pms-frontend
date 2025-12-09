import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { store } from '@/store'
import { AuthProvider } from '@/contexts/AuthContext'
import { ShiftProvider } from '@/contexts/ShiftContext'
import { AuthInitializer } from '@/components/AuthInitializer'
import Router from '@/router'

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
          <AuthProvider>
            <ShiftProvider>
              <AuthInitializer>
                <Router />
              </AuthInitializer>
            </ShiftProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  )
}

export default App
