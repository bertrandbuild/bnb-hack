import React from "react";

// import globalContext
import { useGlobalContext } from "../../context/globalContext";

const PortfolioDetails: React.FC = () => {
  const { portfolio } = useGlobalContext();

  return (
    <div className="flex justify-between mb-2">
      <span className="text-secondary">Initial {portfolio.initialQuoteSize} USDC</span>
      <span className="text-secondary">Current {portfolio.currentQuoteSize} USDC</span>
      {portfolio.pnl > 0 && <span className="text-secondary">{portfolio.pnl.toFixed(2)} PNL</span>}
      <span className="text-secondary">${portfolio.totalUsd} USD - {portfolio.totalBtc} BTC</span>
    </div>
  );
};

export default PortfolioDetails;
