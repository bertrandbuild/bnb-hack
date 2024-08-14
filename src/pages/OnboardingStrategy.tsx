import React, { useEffect, useState } from "react";
// import interfaces
import { IStrategy } from "../components/StrategyControls/interface";
// import components
import StrategyCard from "../components/ui/StrategyCard";
import CustomStrategyModal from "../components/CustomStrategyModal"; // Import the new modal
// import global context
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { getStrategiesFromGreenfield } from "../services/bnbGreenfieldService";
import toast from "react-hot-toast";
import Loading from "../components/ui/Loading";

const bucketName = "test-bnb-hack";
const objectName = 'strategies.json';

const OnboardingStrategy: React.FC = () => {
  const { updateContext } = useGlobalContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const {address, connector} = useAccount();
  const [isLoading, setIsLoading] = useState(true);
  const [strategies, setStrategies] = useState<IStrategy[]>([]);

  // TODO: create a new bucket if it doesn't exist (user's bucket)
  // TODO: upload the new strategy to greenfield (user's bucket)

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

  const loadStrategiesFromGreenfield = async () => {
    if (!address || !connector) return;

    try {
      if (!connector.getProvider) return; // if not provider, fail silently and wait next run
      const strategies = await getStrategiesFromGreenfield(bucketName, objectName, address, connector);
      if (!strategies) return;
      setStrategies(strategies);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Error loading strategies");
    }
  };

  // loadStrategies onload
  useEffect(() => {
    loadStrategiesFromGreenfield();
  }, [address, connector]);

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Choose your strategy</h1>
        </div>
        {isLoading ? <Loading/> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => (
            <StrategyCard
              key={index}
              title={strategy.title}
              type={strategy.type}
              imgUrl={strategy.imgUrl}
              badge='New'
              buttonLabel='Choose'
              onChoose={(e) => handleChooseStrategy(e, strategy)}
            />
          ))}
          <StrategyCard
            key={strategies.length}
            title={"Custom strategy"}
            type={"Create a custom strategy"}
            imgUrl={"https://picsum.photos/200/300"}
            badge={"New"}
            buttonLabel={"Create"}
            onChoose={(e) => openNewStrategyModal(e)}
            />
          </div>
        )}
      </div>
      <CustomStrategyModal isOpen={isModalOpen} onClose={closeNewStrategyModal} />
    </div>
  );
};

export default OnboardingStrategy;