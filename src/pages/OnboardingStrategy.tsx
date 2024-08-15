import React, { useEffect, useState } from "react";
// import interfaces
import { IStrategy } from "../components/StrategyControls/interface";
// import components
import StrategyCard from "../components/ui/StrategyCard";
import CustomStrategyModal from "../components/CustomStrategyModal"; // Import the new modal
// import global context
import { useGlobalContext } from "../context/globalContext";
import { useNavigate } from "react-router-dom";
import { useAccount, useSwitchChain } from "wagmi";
import { listAllObjectsFromBucket } from "../services/bnbGreenfieldService";
import toast from "react-hot-toast";
import Loading from "../components/ui/Loading";
import { BUCKET_NAME, GREEN_CHAIN_ID } from "../config/env";
import defaultStrategy from '../utils/ma-cross-strategy.json';

const bucketName = BUCKET_NAME;

const OnboardingStrategy: React.FC = () => {
  const { updateContext } = useGlobalContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const {address, connector, chain, isConnected} = useAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [strategies, setStrategies] = useState<IStrategy[]>([defaultStrategy]);
  const { switchChain } = useSwitchChain();
  const isOnGreenfield = chain?.id === GREEN_CHAIN_ID;
  
  const switchToGreenfieldNetwork = () => {
    if (!isOnGreenfield && switchChain) {
      switchChain({ chainId: GREEN_CHAIN_ID });
    }
  }

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
  const closeNewStrategyModal = (newStrategy?: IStrategy) => {
    if(newStrategy) setStrategies([...strategies, newStrategy])
    setIsModalOpen(false);
  };

  const loadUserStrategiesFromGreenfield = async () => {
    if (!address || !connector) return;

    setIsLoading(true);

    try {
      if (!connector.getProvider) return;
      const newStrategies = await listAllObjectsFromBucket(bucketName, address, connector);
      if (!newStrategies || newStrategies.length === 0) return;

          // Merge strategies, avoiding duplicates based on title
      const mergedStrategies = [
        ...strategies,
        ...newStrategies.filter(newStrategy => 
          !strategies.some(existingStrategy => existingStrategy.title === newStrategy.title)
        )
      ];
      
      setStrategies(mergedStrategies);

    } catch (error) {
      console.error(error);
      toast.error("Error loading strategies");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && isOnGreenfield) loadUserStrategiesFromGreenfield()
  }, [])

  return (
    <div className="flex flex-col">
      <div className="container mx-auto px-4 flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">Choose your strategy</h1>
          <ul className="flex items-center">
            <li className="mr-4">
              <button onClick={openNewStrategyModal} className="btn btn-sm text-primary rounded">
                Create a custom strategy
              </button>
            </li>
            <li>
                {isOnGreenfield ? (
                  (isLoading ? ( <Loading />):(
                    <button onClick={loadUserStrategiesFromGreenfield} className="btn btn-sm text-primary rounded">
                      Load your strategies
                    </button>
                  ))
                ) : (
                  (!isConnected ? (
                    <span className="tooltip" data-tip="You need to be connected">
                      <button className="btn btn-sm btn-disabled rounded">
                        Load your strategies
                      </button>
                    </span>
                  ):(
                    <button onClick={switchToGreenfieldNetwork} className="btn btn-sm text-primary rounded">
                      Switch to Greenfield to load your custom strategies
                    </button>
                  ))
                )}
            </li>
          </ul>
        </div>
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
      </div>
    </div>
      <CustomStrategyModal isOpen={isModalOpen} onClose={closeNewStrategyModal} />
    </div>
  );
};

export default OnboardingStrategy;