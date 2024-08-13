import { ITradeIntent } from "../StrategyControls/interface";
import { ITrade } from "./interface";
import { v4 as uuid } from "uuid";
import { IPortfolio } from "./interface";

// import context
import { useGlobalContext } from "../../context/globalContext";

const usePortfolio = () => {
  const { updateContext, portfolio } = useGlobalContext();

  const addTrade = async (
    tradeIntent: ITradeIntent
  ): Promise<IPortfolio | null> => {
    if (!portfolio.trades) {
      console.error("Empty portfolio.");
      return null;
    }

    const priceBTC = tradeIntent.priceBTC;

    // Determine the action based on the asset being traded from
    const action: "Buy" | "Sell" =
      tradeIntent.action === "BUY" ? "Buy" : "Sell";

    const trade: ITrade = {
      id: uuid(),
      timestamp: new Date().getTime(),
      action,
      tokenPair: "BTC/USDC",
      reason: tradeIntent.reason,
      price: priceBTC,
      status: "Completed",
    };

    // Update the portfolio with the new trade
    console.log("Trades before adding:", portfolio.trades);
    const newPortfolio = {
      ...portfolio,
      trades: [...portfolio.trades, trade],
      tradeInProgress: trade, 
    };
    console.log("Trades after adding:", newPortfolio.trades);

    await updateContext("portfolio", newPortfolio);

    return newPortfolio;
  };

  // Calculate the total value and PNL of the portfolio based and the actual BTC price
  const calculatePortfolioValueAndPNL = async (
    portfolio: IPortfolio,
    tradeIntent: ITradeIntent
  ) => {
    const { initialQuoteSize, trades, totalBtc, totalUsd } = portfolio;

    const priceBTC = tradeIntent.priceBTC;

    // Initialize values with current portfolio values
    let newTotalBtc = totalBtc;
    let newTotalUsd = totalUsd;

    trades.forEach((trade) => {
      if (trade.action === "Buy") {
        // Convert everything BTC
        newTotalBtc = newTotalUsd / trade.price;
        newTotalUsd = 0;
      } else if (trade.action === "Sell") {
        // Convert everything USDC
        newTotalUsd = newTotalBtc * trade.price;
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

  return {
    calculatePortfolioValueAndPNL,
    addTrade,
  };
};

export default usePortfolio;
