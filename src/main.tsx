import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { GlobalProvider } from './context/globalContext';
import { Toaster } from 'react-hot-toast';
import Router from './config/router.tsx';
import { WalletProvider } from './config/wallet.tsx';
import BacktestingProvider from './context/backtestingContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalProvider>
    <BacktestingProvider>
      <WalletProvider>
          <Router />
          <Toaster position="top-right" />
        </WalletProvider>
      </BacktestingProvider>
    </GlobalProvider>
  </React.StrictMode>
);
