import React, { createContext, useState, useEffect } from "react";
import { IPortfolio } from "../components/portfolio/interface";
import { IStrategy } from "../components/StrategyControls/interface";
import { loadAllFromLocalStorage } from "../utils/localStorage";

// Specifies the structure of the global context
interface IGlobalContextType {
  userAddress: string | null;
  strategy: IStrategy | null;
  portfolio: IPortfolio;
  updateContext: (key: string, value: unknown) => void;
}

// This is the initial state of the global context (if not loaded from localStorage)
const initialLocalStorageConfig = {
  userAddress: null,
  strategy: null,
  portfolio: {
    initialQuoteSize: 0,
    currentQuoteSize: 0,
    pnl: 0,
    totalBtc: 0,
    totalUsd: 0,
    trades: [],
    tradeInProgress: null,
  },
};

// Default context values
const defaultContext: IGlobalContextType = {
  userAddress: null,
  strategy: null,
  portfolio: {
    initialQuoteSize: 0,
    currentQuoteSize: 0,
    pnl: 0,
    totalBtc: 0,
    totalUsd: 0,
    trades: [],
    tradeInProgress: null,
  },
  updateContext: () => {},
};

// Creates a global context with the default values and a function to update the context.
export const GlobalContext = createContext<IGlobalContextType>(defaultContext);

// Initialize the context with the default values and load from localStorage
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [globalState, setGlobalState] = useState(defaultContext);

  const _saveToLocalStorage = (key: string, value: unknown) => {
    if (typeof window !== "undefined") {
      console.log(`Saving ${key} to localStorage:`, value);
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Global function to update the context and save to localStorage
  const updateContext = (key: string, value: unknown) => {
    console.log(`Updating context key "${key}" with value:`, value);
    setGlobalState((prevState) => {
      const newState = { ...prevState, [key]: value };

      console.log(`Previous state:`, prevState);
      console.log(`New state:`, newState);

      _saveToLocalStorage(key, value);
      console.log("New global state after update:", newState);
      return newState;
    });
  };

  // Initialize the context with the default values and load from localStorage
  useEffect(() => {
    console.log("Loading initial state from localStorage...");
    const loadedState = loadAllFromLocalStorage(initialLocalStorageConfig);
    // Init state by loading from localStorage
    setGlobalState((prevState) => ({
      ...prevState,
      ...loadedState,
    }));
    console.log("Global state after loading from localStorage:", globalState);
  }, []);

  return (
    <GlobalContext.Provider value={{ ...globalState, updateContext }}>
      {children}
    </GlobalContext.Provider>
  );
};
