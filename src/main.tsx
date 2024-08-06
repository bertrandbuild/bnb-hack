import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";

// import components
import OnboardingStrategy from "./pages/OnboardingStrategy.tsx";
import OnboardingPortfolio from "./pages/OnboardingPortfolio.tsx";

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
    ],
  },
]);

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}
