import React from "react";
import { Link as RouterLink } from "react-router-dom";

// import global context
import { useGlobalContext } from "../context/globalContext";

interface StrategyControlsProps {
  onOpenModal: () => void;
}

const StrategyControls: React.FC<StrategyControlsProps> = ({ onOpenModal }) => {
  const { strategy, portfolioSize } = useGlobalContext();

  return (
    <div className="w-1/3">
      <div className="bg-gray-100 p-4 rounded-lg shadow-inner mb-4">
        <div className="flex justify-between mb-2">
          <span>{portfolioSize} USDT</span>
          <span>+0 PNL</span>
          <span>0% wBTC 100% USDC</span>
        </div>
        <div className="text-center my-4">
          <p className="font-semibold">{strategy?.title}</p>
          <RouterLink to="/">
            <button className="text-blue-500 underline text-sm">
              change strategy
            </button>
          </RouterLink>
        </div>
        <div className="flex justify-center items-center flex-col mt-4">
          <button className="btn btn-primary mb-2" onClick={onOpenModal}>
            Start the strategy
          </button>
          <span className="text-sm text-gray-500">- OR -</span>
          <button className="btn btn-secondary mt-2">
            Apply the strategy to this graph
          </button>
          <p className="text-xs text-gray-400 mt-2">
            The strategy can't be changed after start
          </p>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <button className="btn btn-warning w-full">
          Start backtesting (-60 days)
        </button>
      </div>
    </div>
  );
};

export default StrategyControls;
