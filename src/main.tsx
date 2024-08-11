import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./reset.css";
import "./index.css";
import { GlobalProvider } from "./context/globalContext";
import BacktestingProvider from "./context/backtestingContext";
import { Toaster } from "react-hot-toast";
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlobalProvider>
      <BacktestingProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </BacktestingProvider>
    </GlobalProvider>
  </React.StrictMode>
);
