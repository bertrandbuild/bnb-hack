
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

const OnboardingPortfolio: React.FC = () => {
  const [portfolioSize, setPortfolioSize] = useState<number>(500);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    setPortfolioSize(value);
  };

  console.log("portfolioSize: ",portfolioSize);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">
            Define the size of your portfolio
          </h1>
          <p className="mb-4 text-gray-600">To allocate to this strategy</p>
          <div className="flex justify-center items-center mb-4">
            <input
              type="number"
              className="input input-bordered text-center w-1/3"
              value={portfolioSize}
              onChange={handleInputChange}
              min="0"
            />
            <span className="ml-2 text-lg font-medium">USDT</span>
          </div>
          <div className="flex justify-center">
          <RouterLink to="/dashboard">
            <button className="btn btn-primary">
              Next
            </button>
          </RouterLink>
          </div>
        </div>
      </div>
  );
};

export default OnboardingPortfolio;

