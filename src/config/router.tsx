import App from '../App.tsx'
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// import pages
import OnboardingStrategy from "../pages/OnboardingStrategy.tsx";
import OnboardingPortfolio from "../pages/OnboardingPortfolio.tsx";
import Dashboard from "../pages/Dashboard.tsx";
import NotFound from "../pages/NotFound.tsx";

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

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;