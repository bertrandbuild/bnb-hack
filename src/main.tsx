import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { GlobalProvider } from './context/globalContext';
import { Toaster } from 'react-hot-toast';
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import pages
import OnboardingStrategy from "./pages/OnboardingStrategy.tsx";
import OnboardingPortfolio from "./pages/OnboardingPortfolio.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import NotFound from "./pages/NotFound.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <OnboardingStrategy />,
      },
      {
        path: "/onboarding-portfolio",
        element: <OnboardingPortfolio />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" />
    </GlobalProvider>
  </React.StrictMode>,
)
