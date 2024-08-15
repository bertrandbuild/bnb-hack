import React, { createContext, useState } from "react";
import {
  backtestingCharts,
  backtestingChartsTest,
} from "../utils/chartsConfig";

interface BacktestResult {
  id: number;
  date: string;
  result: number;
}

interface BacktestingContextProps {
  backtesting: BacktestResult[];
  setBacktesting: React.Dispatch<React.SetStateAction<BacktestResult[]>>;
  showBacktesting: boolean;
  handleStartBacktesting: () => void;
  toggleBacktesting: () => void;
  useTestChart: boolean;
  toggleChart: () => void;
  selectedChart: string[];
}

export const BacktestingContext = createContext<
  BacktestingContextProps | undefined
>(undefined);

const BacktestingProvider = ({ children }: { children: React.ReactNode }) => {
  const [backtesting, setBacktesting] = useState<BacktestResult[]>([]);
  const [showBacktesting, setShowBacktesting] = useState(false);
  const [useTestChart, setUseTestChart] = useState(false);

  const handleStartBacktesting = () => {
    setShowBacktesting(true);
  };

  const toggleBacktesting = () => {
    setShowBacktesting((prevState) => !prevState);
  };

  const toggleChart = () => {
    setUseTestChart((prevState) => !prevState);
  };

  const selectedChart = useTestChart
    ? backtestingChartsTest
    : backtestingCharts;

  return (
    <BacktestingContext.Provider
      value={{
        backtesting,
        setBacktesting,
        showBacktesting,
        handleStartBacktesting,
        toggleBacktesting,
        useTestChart,
        toggleChart,
        selectedChart,
      }}
    >
      {children}
    </BacktestingContext.Provider>
  );
};

export default BacktestingProvider;