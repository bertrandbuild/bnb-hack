import React from "react";
// import interfaces
import { IStrategy } from "../utils/interfaces";
// import components
import StrategyCard from "../components/ui/StrategyCard";
// import global context
import { useGlobalContext } from "../context/globalContext";

const strategies = [
  {
    title: "Risk balancing",
    description: "Conservative",
    buttonLabel: "Choose",
  },
  {
    title: "Ichimoku cloud",
    description: "Swing trading",
    buttonLabel: "Choose",
  },
  {
    title: "MA Cross - Daily",
    description: "Swing trading",
    buttonLabel: "Choose",
  },
];

const OnboardingStrategy: React.FC = () => {
  const { updateContext } = useGlobalContext();

  // Add strategy to context
  const handleChooseStrategy = (strategy: IStrategy) => {
    updateContext("strategy", strategy );
  };

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Choose your strategy</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => (
            <StrategyCard
              key={index}
              title={strategy.title}
              description={strategy.description}
              buttonLabel={strategy.buttonLabel}
              onChoose={() => handleChooseStrategy(strategy)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OnboardingStrategy;
