import { renderHook } from "@testing-library/react";
import usePortfolioCalculations from "../usePortfolioCalculations";
import { IPortfolio } from "../../interface";
import { ITradeIntent } from "../../../StrategyControls/interface";

describe("usePortfolioCalculations", () => {
  it("Should calculate portfolio and PNL correctly for buy first trades", async () => {
    const { result } = renderHook(() => usePortfolioCalculations());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [
        {
          id: "trade1",
          timestamp: Date.now(),
          action: "Buy",
          tokenPair: "BTC/USDT",
          reason: "Investment",
          price: 55000,
          status: "Completed",
        },
      ],
      totalBtc: 0,
      totalUsd: 1000,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    const calculation = await result.current.calculatePortfolioAndPNL(
      portfolio,
      tradeIntent
    );

    expect(calculation.currentQuoteSize).toBeCloseTo(1000); // 0.018 BTC * 55000 USD/BTC = 1000 USD
    expect(calculation.pnl).toBeCloseTo(0); // PNL is 0% because no gain or loss
  });

  it("Should calculate portfolio and PNL correctly for sell trades", async () => {
    const { result } = renderHook(() => usePortfolioCalculations());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [
        {
          id: "trade2",
          timestamp: Date.now(),
          action: "Sell",
          tokenPair: "BTC/USDT",
          reason: "Profit Taking",
          price: 60000,
          status: "Completed",
        },
      ],
      totalBtc: 0.02,
      totalUsd: 0,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "Sell",
      reason: "Profit Taking",
      priceBTC: 55000,
    };

    const calculation = await result.current.calculatePortfolioAndPNL(
      portfolio,
      tradeIntent
    );

    expect(calculation.currentQuoteSize).toBeCloseTo(1200); // No change, since already in USD
    expect(calculation.pnl).toBeCloseTo(20); // 20% PNL
  });

  it("Should handle an empty portfolio gracefully", async () => {
    const { result } = renderHook(() => usePortfolioCalculations());

    const portfolio: IPortfolio = {
      initialQuoteSize: 0,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [
        {
          id: "trade2",
          timestamp: Date.now(),
          action: "Sell",
          tokenPair: "BTC/USDT",
          reason: "Profit Taking",
          price: 60000,
          status: "Completed",
        },
      ],
      totalBtc: 0,
      totalUsd: 0,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 50000,
    };

    const calculation = await result.current.calculatePortfolioAndPNL(
      portfolio,
      tradeIntent
    );

    expect(calculation.currentQuoteSize).toBeCloseTo(0); // Empty portfolio should have zero value
    expect(calculation.pnl).toBe(0); // 0% PNL
  });
});
