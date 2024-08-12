import React, { useState } from "react";
// import interfaces
import { IStrategy } from "../components/StrategyControls/interface";
// import components
import StrategyCard from "../components/ui/StrategyCard";
import CustomStrategyModal from "../components/CustomStrategyModal"; // Import the new modal
// import global context
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";

const strategies = [
  {
    title: "Risk balancing",
    description: "Conservative",
    badge: "New",
    buttonLabel: "Choose",
  },
];

const OnboardingStrategy: React.FC = () => {
  const { updateContext } = useGlobalContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Add strategy to context and navigate to next page
  const handleChooseStrategy = (e: React.MouseEvent<HTMLButtonElement>, strategy: IStrategy) => {
    e.preventDefault();
    updateContext("strategy", strategy);
    navigate("/onboarding-portfolio");
  };

  // Function to open the modal
  const openNewStrategyModal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  // Function to close the modal
  const closeNewStrategyModal = () => {
    setIsModalOpen(false);
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
              badge={strategy.badge}
              buttonLabel={strategy.buttonLabel}
              onChoose={(e) => handleChooseStrategy(e, strategy)}
            />
          ))}
          <StrategyCard
            key={strategies.length}
            title={"Custom strategy"}
            description={"Create a custom strategy"}
            badge={"New"}
            buttonLabel={"Create"}
            onChoose={(e) => openNewStrategyModal(e)}
          />
        </div>
      </div>
      <CustomStrategyModal isOpen={isModalOpen} onClose={closeNewStrategyModal} />
    </div>
  );
};

export default OnboardingStrategy;