import React from "react";
import { strategies } from "../utils/Strategies"
// import interfaces
import { IStrategy } from "../components/StrategyControls/interface";
// import components
import StrategyCard from "../components/ui/StrategyCard";
// import global context
import { useGlobalContext } from "../context/globalContext";

const OnboardingStrategy: React.FC = () => {
  const { updateContext } = useGlobalContext();

  // Add strategy to context
  const handleChooseStrategy = (strategy: IStrategy) => {
    updateContext("strategy", strategy);
  };

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">
            Choose your strategy
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => (
            <StrategyCard
              key={index}
              image={strategy.image}
              title={strategy.title}
              description={strategy.description}
              badge={strategy.badge}
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
