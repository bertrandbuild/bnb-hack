import { useContext } from "react";
import { BacktestingContext } from "../context/backtestingContext";

export const useBacktestingContext = () => {
  const context = useContext(BacktestingContext);
  if (!context) {
    throw new Error(
      "useBacktestingContext must be used within a BacktestingProvider"
    );
  }
  return context;
};
