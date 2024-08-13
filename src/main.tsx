import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
// Global Context
import { GlobalProvider } from './context/globalContext';
// Toaster
import { Toaster } from 'react-hot-toast';
// Router
import Router from './config/router';
// wagmi / web3modal / Tanstack Query
import { WalletProvider } from './config/wallet'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalProvider>
      <WalletProvider>
        <Router />
        <Toaster position="top-right" />
      </WalletProvider>
    </GlobalProvider>
  </React.StrictMode>,
)
