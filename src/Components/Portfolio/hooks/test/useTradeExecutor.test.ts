import { renderHook } from "@testing-library/react";
import useTradeExecutor from "../useTradeExecutor";
import { IPortfolio } from "../../interface";
import { ITradeIntent } from "../../../StrategyControls/interface";

describe("useTradeExecutor", () => {
  it("Should execute a buy trade with available funds", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 1000,
      pnl: 0,
      trades: [],
      totalBtc: 0,
      totalUsd: 1000,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "BUY",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).not.toBeNull();
    expect(updatedPortfolio!.trades.length).toBe(1);
    expect(updatedPortfolio!.tradeInProgress).not.toBeNull();
    expect(updatedPortfolio!.tradeInProgress!.action).toBe("Buy");
  });

  it("Should not execute a buy trade if no funds", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [],
      totalBtc: 0,
      totalUsd: 0,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "BUY",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).toBeNull();
  });

  it("Should not execute a buy trade if trade is already in progress", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [
        {
          id: "existing-trade",
          timestamp: Date.now(),
          action: "Buy",
          tokenPair: "BTC/USDC",
          reason: "Investment",
          price: 50000,
          status: "Completed",
        },
      ],
      totalBtc: 0.2,
      totalUsd: 1000,
      tradeInProgress: {
        id: "existing-trade",
        timestamp: Date.now(),
        action: "Buy",
        tokenPair: "BTC/USDC",
        reason: "Investment",
        price: 50000,
        status: "Completed",
      },
    };

    const tradeIntent: ITradeIntent = {
      action: "BUY",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).toBeNull();
  });

  it("Should execute a sell trade when a buy trade is in progress", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 0,
      pnl: 0,
      trades: [
        {
          id: "existing-trade",
          timestamp: Date.now(),
          action: "Buy",
          tokenPair: "BTC/USDC",
          reason: "Investment",
          price: 50000,
          status: "Completed",
        },
      ],
      totalBtc: 0.2,
      totalUsd: 1000,
      tradeInProgress: {
        id: "existing-trade",
        timestamp: Date.now(),
        action: "Buy",
        tokenPair: "BTC/USDC",
        reason: "Investment",
        price: 50000,
        status: "Completed",
      },
    };

    const tradeIntent: ITradeIntent = {
      action: "SELL",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).not.toBeNull();
    expect(updatedPortfolio!.trades.length).toBe(2);
    expect(updatedPortfolio!.tradeInProgress).toBeNull(); // No trade in progress after a sell
  });

  it("Should not execute a sell trade if no trade in progess", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 1000,
      pnl: 0,
      trades: [],
      totalBtc: 0,
      totalUsd: 1000,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "SELL",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).toBeNull();
  });

  it("Should not execute a buy trade if no USD available after selling BTC", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 1000,
      pnl: 0,
      trades: [{
        id: "trade1",
        timestamp: Date.now(),
        action: "Sell",
        tokenPair: "BTC/USDC",
        reason: "Profit Taking",
        price: 55000,
        status: "Completed",
      },],
      totalBtc: 0,
      totalUsd: 0,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "BUY",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).toBeNull();
  });

  it("Should handle unknown actions gracefully", async () => {
    const { result } = renderHook(() => useTradeExecutor());

    const portfolio: IPortfolio = {
      initialQuoteSize: 1000,
      currentQuoteSize: 1000,
      pnl: 0,
      trades: [],
      totalBtc: 0,
      totalUsd: 0,
      tradeInProgress: null,
    };

    const tradeIntent: ITradeIntent = {
      action: "UNKNOWN",
      reason: "Investment",
      priceBTC: 50000,
    };

    const updatedPortfolio = await result.current.executeTrade(
      portfolio,
      tradeIntent
    );

    expect(updatedPortfolio).toBeNull();
  });
});
