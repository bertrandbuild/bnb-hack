import React, { createContext, useState, useContext } from "react";

interface BacktestingContextProps {
  backtesting: any[];
  setBacktesting: React.Dispatch<React.SetStateAction<any[]>>;
  showBacktesting: boolean;
  handleStartBacktesting: () => void;
}

const BacktestingContext = createContext<BacktestingContextProps | undefined>(undefined);

export const useBacktestingContext = () => {
  const context = useContext(BacktestingContext);
  if (!context) {
    throw new Error("useBacktesting must be used within a BacktestingProvider");
  }
  return context;
};

const BacktestingProvider = ({ children }: { children: React.ReactNode }) => {
  const [backtesting, setBacktesting] = useState<any[]>([]);
  const [showBacktesting, setShowBacktesting] = useState(false);

  const handleStartBacktesting = () => {
    setShowBacktesting(true);
  };

  return (
    <BacktestingContext.Provider
      value={{ backtesting, setBacktesting, showBacktesting, handleStartBacktesting }}
    >
      {children}
    </BacktestingContext.Provider>
  );
};

export default BacktestingProvider;
