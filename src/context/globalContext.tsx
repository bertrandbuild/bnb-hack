import React, { createContext, useState, useContext, useEffect } from "react";
import { IPortfolio, IStrategy } from "../utils/interfaces";
import axios from 'axios';

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
  },
};

// Specifies the structure of the global context
interface IGlobalContextType {
  userAddress: string | null;
  strategy: IStrategy | null;
  portfolio: IPortfolio;
  updateContext: (key: string, value: unknown) => void;
  reloadPortfolioData: (newPortfolio?: IPortfolio) => void;
}

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
  },
  updateContext: () => {},
  reloadPortfolioData: () => {},
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

// Initialize the context with the default values and load from localStorage
export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [globalState, setGlobalState] = useState(defaultContext);

  const _saveToLocalStorage = (key: string, value: unknown) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const fetchBTCPrice = async (): Promise<number> => {
    const defaultBTCPrice = 50000; // FIXME: move to backend because cors + save in localStorage to avoid fetching every time
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      return response.data.bitcoin.usd;
    } catch (error) {
      console.error("Error fetching BTC price, using default value", error);
      return defaultBTCPrice;
    }
  }

  const calculatePortfolioValueAndPNL = async (portfolio: IPortfolio) => {
    const { initialQuoteSize, trades, totalBtc, totalUsd } = portfolio;
    const btcPrice = await fetchBTCPrice();
  
    let newTotalBtc = totalBtc;
    let newTotalUsd = totalUsd;
    trades.forEach((trade) => {
      if (trade.action === 'Buy') {
        newTotalBtc += trade.baseAmount;
        newTotalUsd -= trade.baseAmount * trade.price;
      } else {
        newTotalBtc -= trade.baseAmount;
        newTotalUsd += trade.baseAmount * trade.price;
      }
    });
  
    const currentQuoteSize = newTotalUsd + (newTotalBtc * btcPrice);
    const pnl = ((currentQuoteSize - initialQuoteSize) / initialQuoteSize) * 100;
  
    return { currentQuoteSize, pnl, totalBtc: newTotalBtc, totalUsd: newTotalUsd };
  }

  const reloadPortfolioData = async (newPortfolio: IPortfolio = globalState.portfolio) => {
    const { currentQuoteSize, pnl, totalBtc, totalUsd } = await calculatePortfolioValueAndPNL(newPortfolio);
    updateContext('portfolio', { ...newPortfolio, currentQuoteSize, pnl, totalBtc, totalUsd });
  };

  // Global function to update the context and save to localStorage
  const updateContext = (key: string, value: unknown) => {
    setGlobalState(prevState => {
      const newState = { ...prevState, [key]: value };
      _saveToLocalStorage(key, value);
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
    const interval = setInterval(reloadPortfolioData, 24 * 60 * 60 * 1000); // 24 hours
    return () => clearInterval(interval);
  }, []);

  return (
    <GlobalContext.Provider value={{ ...globalState, updateContext, reloadPortfolioData }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);