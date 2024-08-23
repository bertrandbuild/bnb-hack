import { ITradeIntent } from "../../StrategyControls/interface";
import { ITrade, IPortfolio } from "../interface";
import { v4 as uuid } from "uuid";

const useTradeExecutor = () => {
  const executeTrade = async (
    portfolio: IPortfolio,
    tradeIntent: ITradeIntent
  ): Promise<IPortfolio | null> => {
    // Map action to valid strings, or return early if invalid
    const action: "Buy" | "Sell" | null =
      tradeIntent.action === "BUY"
        ? "Buy"
        : tradeIntent.action === "SELL"
        ? "Sell"
        : null;
        
    // Early exit if action is invalid
    if (!action) {
      console.warn(`Invalid trade action: ${tradeIntent.action}`);
      return null;
    }

    // Check available funds for a purchase
    if (portfolio.totalUsd === 0 && action === "Buy") {
      console.warn("No USD available for purchase.");
      return null;
    }

    // If a buy trade is in progress, allow only sell signals
    if (portfolio.tradeInProgress) {
      if (portfolio.tradeInProgress.action === "Buy" && action === "Buy") {
        console.warn(
          "A BUY trade is already in progress. Cannot add another BUY trade."
        );
        return null;
      }
    } else if (action === "Sell") {
      console.warn("No trade in progress. Cannot execute SELL trade.");
      return null;
    }

    const trade: ITrade = {
      id: uuid(),
      timestamp: new Date().getTime(),
      action: action,
      tokenPair: "BTC/USDC",
      reason: tradeIntent.reason,
      price: tradeIntent.priceBTC,
      status: "Completed",
    };

    const newPortfolio = {
      ...portfolio,
      trades: [...portfolio.trades, trade],
      tradeInProgress: action === "Buy" ? trade : null, // Set to null if it's a Sell action
    };

    return newPortfolio;
  };

  return { executeTrade };
};

export default useTradeExecutor;
