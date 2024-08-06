import React, { createContext, useState, useContext, useEffect } from "react";
import { IStrategyTrades, IStrategy } from "../utils/interfaces";

// This is the initial state of the global context (if not loaded from localStorage)
const initialLocalStorageConfig = {
  userAddress: null,
  strategyTrades: null,
  strategy: null,
};

// Specifies the structure of the global context, with a userAddress, strategyTrades, and an updateContext function.
interface IGlobalContextType {
  userAddress: string | null;
  strategyTrades: IStrategyTrades | null;
  strategy: IStrategy | null;
  updateContext: (key: string, value: unknown) => void;
}

// Default context values
const defaultContext: IGlobalContextType = {
  userAddress: null,
  strategyTrades: null,
  strategy: null,
  updateContext: () => {},
};

// Creates a global context with the default values and a function to update the context.
export const GlobalContext = createContext<IGlobalContextType>(defaultContext);

// Loads a value from localStorage, or returns the default value if it is not found.
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

// Loads all values from localStorage, or returns the default values if they are not found.
const loadAllFromLocalStorage = (config: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(config).map(([key, defaultValue]) => 
      [key, loadFromLocalStorage(key, defaultValue)]
    )
  );
};

// Saves a value to localStorage.
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

  // Initialize the context with the default values and load from localStorage
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