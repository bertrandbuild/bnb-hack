import React from "react";

// import components
import TradeHistory from "./Portfolio/TradeHistory";
import TradingViewWidget from "./ui/TradingViewWidget";
import Backtesting from "./ui/Backtesting";

const ChartSection: React.FC<{ showBacktesting: boolean }> = ({ showBacktesting }) => {
  return (
    <div className="flex-1 mr-4 w-full">
      <div className="bg-gray-200 rounded-lg overflow-hidden shadow-inner mb-4 h-[65vh]">
         { showBacktesting ? <Backtesting /> : <TradingViewWidget />}
      </div>
      {/* Bottom Section: Trade History */}
      <TradeHistory />
    </div>
  );
};

export default ChartSection;
