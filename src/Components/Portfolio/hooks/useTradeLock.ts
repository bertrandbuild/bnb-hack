import { useRef } from "react";

const useTradeLock = () => {
  const tradeLock = useRef(false);

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
