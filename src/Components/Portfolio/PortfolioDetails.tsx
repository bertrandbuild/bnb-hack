import React from "react";

// import globalContext
import { useGlobalContext } from "../../context/globalContext";

// import components
import StatItem from "../ui/StatItem";

const PortfolioDetails: React.FC = () => {
  const { portfolio } = useGlobalContext();
  const { initialQuoteSize, currentQuoteSize, pnl } = portfolio;

  return (
    <div className="flex">
      <div className="stats stats-horizontal shadow rounded-lg w-full">
        <StatItem title="Initial Value" value={`${initialQuoteSize} USDC`} />
        <StatItem
          title="Current Value"
          value={`${currentQuoteSize.toFixed(2)} USDC`}
        />
        {pnl > 0 && <StatItem title="% PNL" value={pnl.toFixed(1)} />}
      </div>
      {/* TODO : Implementation in ???
      <div className="stat">
        <div className="stat-title"></div>
        <div className="stat-value text-xl text-secondary">
          ${portfolio.totalUsd} USD - {portfolio.totalBtc.toFixed(5)} BTC
        </div>
      </div> */}
    </div>
  );
};

export default PortfolioDetails;
