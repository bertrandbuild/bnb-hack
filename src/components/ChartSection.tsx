import React from "react";

// import components
import TradeHistory from "./TradeHistory";

const ChartSection: React.FC = () => {
  return (
    <div className="flex-1 mr-4">
      <div className="bg-gray-200 rounded-lg overflow-hidden shadow-inner mb-4">
        <img src="https://via.placeholder.com/800x400" alt="Chart" />
      </div>
      {/* Bottom Section: Trade History */}
      <TradeHistory />
    </div>
  );
};

export default ChartSection;
