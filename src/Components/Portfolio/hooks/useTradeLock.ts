import { useRef } from "react";

const useTradeLock = () => {
  const tradeLock = useRef(false);

  /**
   * Lock a trade, ie: do not buy if a trade is already in progress
   * it's to handle an exception where the llm try to buy even if there is nothing left in the portfolio (trade in progress)
   */
  const lockTrade = () => {
    if (tradeLock.current) {
      console.warn("Trade operation already in progress. Skipping the trade.");
      return false;
    }
    tradeLock.current = true;
    return true;
  };

  const unlockTrade = () => {
    tradeLock.current = false;
  };
  return { lockTrade, unlockTrade };
};

export default useTradeLock;
