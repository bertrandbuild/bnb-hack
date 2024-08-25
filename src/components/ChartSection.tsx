import React from "react";

// import components
import TradeHistory from "./portfolio/TradeHistory";
import TradingViewWidget from "./ui/TradingViewWidget";
import Backtesting from "./backtestingControls/Backtesting";

// import context
import { useBacktestingContext } from "../hooks/useBacktestingContext";

const ChartSection: React.FC = () => {
  const { showBacktesting } = useBacktestingContext();

  return (
    <div className="flex-1 mr-4 w-full">
      <div className="bg-gray-200 rounded-lg overflow-hidden shadow-inner mb-4 h-[65vh]">
        {showBacktesting ? <Backtesting /> : <TradingViewWidget />}
      </div>
      {/* Bottom Section: Trade History */}
      <TradeHistory />
    </div>
  );
};

export default ChartSection;
