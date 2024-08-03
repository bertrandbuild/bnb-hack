import React, { createContext, useState, useContext, useEffect } from "react";
import { IStrategyTrades } from "../utils/interfaces";

// This is the initial state of the global context (if not loaded from localStorage)
const initialLocalStorageConfig = {
  userAddress: null,
  strategyTrades: null,
};

interface IGlobalContextType {
  userAddress: string | null;
  strategyTrades: IStrategyTrades | null;
  updateContext: (key: string, value: unknown) => void;
}

const defaultContext: IGlobalContextType = {
  userAddress: null,
  strategyTrades: null,
  updateContext: () => {},
};

export const GlobalContext = createContext<IGlobalContextType>(defaultContext);

const loadFromLocalStorage = (key: string, defaultValue: unknown) => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error(`Error parsing JSON for key "${key}":`, error);
        localStorage.removeItem(key);
      }
    }
  }
  return defaultValue;
};

const loadAllFromLocalStorage = (config: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(config).map(([key, defaultValue]) => 
      [key, loadFromLocalStorage(key, defaultValue)]
    )
  );
};

const saveToLocalStorage = (key: string, value: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initialize the context with the default values and load from localStorage
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalState, setGlobalState] = useState(defaultContext);

  // Global function to update the context and save to localStorage
  const updateContext = (key: string, value: unknown) => {
    setGlobalState(prevState => {
      const newState = { ...prevState, [key]: value };
      saveToLocalStorage(key, value);
      return newState;
    });
  };

  useEffect(() => {
    // Init state by loading from localStorage
    setGlobalState(prevState => ({
      ...prevState,
      ...loadAllFromLocalStorage(initialLocalStorageConfig)
    }));
  }, []);

  return (
    <GlobalContext.Provider value={{ ...globalState, updateContext }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);