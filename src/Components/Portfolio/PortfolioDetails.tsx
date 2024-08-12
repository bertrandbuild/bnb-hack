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
      <div className="stats stats-vertical shadow rounded-lg w-full">
        <StatItem title="Initial Value" value={`${initialQuoteSize} USDC`} />
        <StatItem
          title="Current Value"
          value={`${currentQuoteSize ? currentQuoteSize.toFixed(2) : "0.00"} USDC`}
        />
        {pnl !== null && pnl !== undefined && (
          <StatItem title="% PNL" value={pnl.toFixed(1)} />
        )}
        <StatItem
          title="Value Portfolio"
          value={`${portfolio.totalUsd} USD - ${portfolio.totalBtc.toFixed(5)} BTC`}
        />
      </div>
    </div>
  );
};

export default PortfolioDetails;
