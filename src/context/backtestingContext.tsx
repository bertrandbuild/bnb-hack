import React, { createContext, useState, useContext } from "react";

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
}

const BacktestingContext = createContext<BacktestingContextProps | undefined>(
  undefined
);

export const useBacktestingContext = () => {
  const context = useContext(BacktestingContext);
  if (!context) {
    throw new Error("useBacktesting must be used within a BacktestingProvider");
  }
  return context;
};

const BacktestingProvider = ({ children }: { children: React.ReactNode }) => {
  const [backtesting, setBacktesting] = useState<BacktestResult[]>([]);
  const [showBacktesting, setShowBacktesting] = useState(false);

  const handleStartBacktesting = () => {
    setShowBacktesting(true);
  };

  const toggleBacktesting = () => {
    setShowBacktesting((prevState) => !prevState);
  };

  return (
    <BacktestingContext.Provider
      value={{
        backtesting,
        setBacktesting,
        showBacktesting,
        handleStartBacktesting,
        toggleBacktesting,
      }}
    >
      {children}
    </BacktestingContext.Provider>
  );
};

export default BacktestingProvider;
