import { ITradeIntent } from "../StrategyControls/interface";
import { useGlobalContext } from "../../context/globalContext";
import { ITrade } from "./interface";
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import { IPortfolio } from "./interface";

const usePortfolio = () => {
  const { updateContext, portfolio } = useGlobalContext();

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

  const addTrade = async (tradeIntent: ITradeIntent) => {
    const action = tradeIntent.assetFrom === 'USDC' ? 'Buy' : 'Sell';
    const btcPrice = await fetchBTCPrice();
    const btcAmount = Number(tradeIntent.value) / btcPrice;

    const trade: ITrade = {
      id: uuid(),
      timestamp: new Date().getTime(),
      action,
      tokenPair: `${tradeIntent.assetFrom}${tradeIntent.assetTo}`,
      reason: tradeIntent.reason,
      baseAmount: btcAmount,
      quoteAmount: Number(tradeIntent.value),
      price: btcPrice,
      status: 'Completed'
    }
    const newPortfolio = { ...portfolio, trades: [...portfolio.trades, trade] };
    await updateContext("portfolio", newPortfolio);
    console.log("portfolio after add trade", newPortfolio);
    return newPortfolio;
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

  return {
    calculatePortfolioValueAndPNL,
    addTrade
  };
};

export default usePortfolio;