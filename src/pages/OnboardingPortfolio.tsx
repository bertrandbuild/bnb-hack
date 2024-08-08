import React from "react";
import { Link as RouterLink } from "react-router-dom";

// import global Context
import { useGlobalContext } from "../context/globalContext";

const OnboardingPortfolio: React.FC = () => {
  const { portfolio, updateContext } = useGlobalContext();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    updateContext("portfolio", { ...portfolio, initialQuoteSize: value });
  };

  return (
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold text-primary">
          Define the size of your portfolio
        </h1>
        <p className="mb-4 text-gray-600 text-secondary">To allocate to this strategy</p>
        <div className="flex justify-center items-center mb-4">
          <input
            type="number"
            className="input input-bordered text-center w-1/3 text-primary"
            value={portfolio.initialQuoteSize}
            onChange={handleInputChange}
            min="0"
          />
          <span className="ml-2 text-lg font-medium text-secondary">USDT</span>
        </div>
        <div className="flex justify-center">
          <RouterLink to="/dashboard">
            <button className="btn btn-primary">Next</button>
          </RouterLink>
        </div>
      </div>
  );
};

export default OnboardingPortfolio;
