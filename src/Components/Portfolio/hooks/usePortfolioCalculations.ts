import { IPortfolio } from "../interface";
import { ITradeIntent } from "../../StrategyControls/interface";

const usePortfolioCalculations = () => {
  const calculatePortfolioAndPNL = async (
    portfolio: IPortfolio,
    tradeIntent: ITradeIntent
  ): Promise<{
    currentQuoteSize: number;
    pnl: number;
    totalBtc: number;
    totalUsd: number;
  }> => {
    const { initialQuoteSize, trades, totalBtc, totalUsd } = portfolio;
    const priceBTC = tradeIntent.priceBTC;

    // Initialize value with current portfolio values
    let newTotalBtc = totalBtc;
    let newTotalUsd = totalUsd;

    trades.forEach((trade) => {
      if (trade.action === "Buy") {
        // Convert everything to BTC
        newTotalBtc += newTotalUsd ? newTotalUsd / trade.price : 0;
        newTotalUsd = 0;

      } else if (trade.action === "Sell") {
        // Convert everuthing t USDC
        newTotalUsd += newTotalBtc * trade.price ? newTotalBtc * trade.price : 0;
        newTotalBtc = 0;
      }
    });

    // Calculate the present value of the portfolio
    const currentQuoteSize = newTotalUsd + newTotalBtc * priceBTC;
    
    // Calculate PNL
    const pnl =
      initialQuoteSize !== 0
        ? ((currentQuoteSize - initialQuoteSize) / initialQuoteSize) * 100
        : 0;

    return {
      currentQuoteSize,
      pnl,
      totalBtc: newTotalBtc,
      totalUsd: newTotalUsd,
    };
  };
  return { calculatePortfolioAndPNL };
};

export default usePortfolioCalculations;
