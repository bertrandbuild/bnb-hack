import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// Global Context
import { GlobalProvider } from './context/globalContext';
// Toaster
import { Toaster } from 'react-hot-toast';
// Router
import Router from './config/router';
// wagmi
import { WagmiProvider } from 'wagmi'
import { config } from './config/wagmi'
// Tanstack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalProvider>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <Router />
          <Toaster position="top-right" />
        </QueryClientProvider>
      </WagmiProvider>
    </GlobalProvider>
  </React.StrictMode>,
)
