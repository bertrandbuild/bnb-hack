import { ITradeIntent } from "../../StrategyControls/interface";
import { IPortfolio } from "../interface";

// improt hooks
import useTradeLock from "./useTradeLock";
import useTradeExecutor from "./useTradeExecutor";
import usePortfolioCalculations from "./usePortfolioCalculations";

// import context
import { useGlobalContext } from "../../../hooks/useGlobalContext";

const usePortfolio = () => {
  const { portfolio, updateContext } = useGlobalContext();

  // Initialize hooks
  const { lockTrade, unlockTrade } = useTradeLock();
  const { executeTrade } = useTradeExecutor();
  const { calculatePortfolioAndPNL } = usePortfolioCalculations();

  // Function to handle a new trade
  const addTrade = async (
    tradeIntent: ITradeIntent
  ): Promise<IPortfolio | null> => {
    if (!lockTrade()) {
      return null;
    }

    try {
      const newPortfolio = await executeTrade(portfolio, tradeIntent);

      if (!newPortfolio) {
        return null;
      }

      // Calculate PNL and update portfolio
      const { currentQuoteSize, pnl, totalBtc, totalUsd } =
        await calculatePortfolioAndPNL(newPortfolio, tradeIntent);

      const updatedPortfolio = {
        ...newPortfolio, // FIXME : InitialQuoteSize (Destructuring)
        currentQuoteSize,
        pnl,
        totalBtc,
        totalUsd,
      };

      // Update local and global portfolio states
      await updateContext("portfolio", updatedPortfolio);

      return updatedPortfolio;
    } catch (error) {
      console.error("Error during addTrade execution:", error);
      return null;
    } finally {
      unlockTrade(); // Ensure the lock is released even if the trade fails
    }
  };

  return {
    portfolio,
    addTrade,
    lockTrade,
    unlockTrade,
  };
};

export default usePortfolio;
