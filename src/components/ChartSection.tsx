import React from "react";

// import components
import TradeHistory from "./TradeHistory";
import TradingViewWidget from "./TradingViewWidget";

const ChartSection: React.FC = () => {
  return (
    <div className="flex-1 mr-4 w-full">
      <div className="bg-gray-200 rounded-lg overflow-hidden shadow-inner mb-4 h-[65vh]">
        <TradingViewWidget />
      </div>
      {/* Bottom Section: Trade History */}
      <TradeHistory />
    </div>
  );
};

export default ChartSection;
