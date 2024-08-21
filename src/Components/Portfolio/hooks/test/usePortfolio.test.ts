import { renderHook, act } from "@testing-library/react";
import usePortfolio from "../usePortfolio";
import { ITradeIntent } from "../../../StrategyControls/interface";
import useTradeLock from "../useTradeLock";
import { useGlobalContext } from "../../../../hooks/useGlobalContext";

// Mock the context and the other hooks
jest.mock("../../../../hooks/useGlobalContext");

jest.mock("../useTradeExecutor", () => ({
  __esModule: true,
  default: () => ({
    executeTrade: jest.fn(async (portfolio, tradeIntent) => {
      // Simulate an invalid action
      if (tradeIntent.action !== "Buy" && tradeIntent.action !== "Sell") {
        throw new Error(`Invalid trade action: ${tradeIntent.action}`);
      }

      // If the action is valid, return an updated portfolio
      return {
        ...portfolio,
        trades: [...portfolio.trades, { ...tradeIntent, id: "test-id" }],
        tradeInProgress:
          tradeIntent.action === "Buy"
            ? { ...tradeIntent, id: "test-id" }
            : null,
      };
    }),
  }),
}));

jest.mock("../usePortfolioCalculations", () => ({
  __esModule: true,
  default: () => ({
    calculatePortfolioAndPNL: jest.fn(async () => ({
      currentQuoteSize: 1100,
      pnl: 10,
      totalBtc: 0.02,
      totalUsd: 0,
    })),
  }),
}));

jest.mock("../useTradeLock");

describe("usePortfolio", () => {
    beforeEach(() => {
        // Mock the return value of useGlobalContext
        (useGlobalContext as jest.Mock).mockReturnValue({
          portfolio: {
            initialQuoteSize: 1000,
            currentQuoteSize: 0,
            pnl: 0,
            trades: [],
            totalBtc: 0,
            totalUsd: 1000,
            tradeInProgress: null,
          },
          updateContext: jest.fn(),
        });
    
        // Mock useTradeLock
        (useTradeLock as jest.Mock).mockReturnValue({
          lockTrade: jest.fn(() => true),
          unlockTrade: jest.fn(),
        });
      });

  it("Should successfully add a trade and calculate PNL", async () => {
    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    await act(async () => {
      const updatedPortfolio = await result.current.addTrade(tradeIntent);
      expect(updatedPortfolio).not.toBeNull();
      expect(updatedPortfolio?.trades.length).toBe(1);
      expect(updatedPortfolio?.currentQuoteSize).toBe(1100);
      expect(updatedPortfolio?.pnl).toBe(10);
    });
  });

  it("Should prevent adding a trade if another trade is in progress", async () => {
    // Mock lockTrade to return false, simulating that a trade is already in progress
    (useTradeLock as jest.Mock).mockReturnValue({
      lockTrade: jest.fn(() => false),
      unlockTrade: jest.fn(),
    });

    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    await act(async () => {
      const updatedPortfolio = await result.current.addTrade(tradeIntent);
      expect(updatedPortfolio).toBeNull(); // Trade should not proceed
    });
  });

  it("Should add a trade to an empty portfolio without errors", async () => {
    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    // Make sure adding a trade to an empty portfolio works
    await act(async () => {
      const updatedPortfolio = await result.current.addTrade(tradeIntent);
      expect(updatedPortfolio?.trades.length).toBe(1);
    });
  });

  it("Should handle invalid trade actions gracefully", async () => {
    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "InvalidAction", // Action invalide
      reason: "Unknown",
      priceBTC: 55000,
    };

    await act(async () => {
      const updatedPortfolio = await result.current.addTrade(tradeIntent);
      expect(updatedPortfolio).toBeNull(); // L'action invalide ne doit pas être traitée
    });
  });

  it("Should prevent race conditions by ensuring only one trade can be added at a time", async () => {
    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    const lockTradeMock = jest
      .spyOn(useTradeLock(), "lockTrade")
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);

    await act(async () => {
      const [firstTrade, secondTrade] = await Promise.all([
        result.current.addTrade(tradeIntent),
        result.current.addTrade(tradeIntent),
      ]);

      expect(firstTrade).not.toBeNull();
      expect(secondTrade).toBeNull(); // The second trade must be blocked
    });

    lockTradeMock.mockRestore();
  });

  it("Should update the global context after a successful trade", async () => {
    const updateContextMock = jest.fn();

    (useGlobalContext as jest.Mock).mockReturnValue({
      portfolio: {
        initialQuoteSize: 1000,
        currentQuoteSize: 0,
        pnl: 0,
        trades: [],
        totalBtc: 0,
        totalUsd: 1000,
        tradeInProgress: null,
      },
      updateContext: updateContextMock,
    });

    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Buy",
      reason: "Investment",
      priceBTC: 55000,
    };

    await act(async () => {
      await result.current.addTrade(tradeIntent);
      expect(updateContextMock).toHaveBeenCalledWith(
        "portfolio",
        expect.any(Object)
      );
    });
  });

  it("Should correctly calculate PNL for a sell trade with profit", async () => {
    const { result } = renderHook(() => usePortfolio());

    const tradeIntent: ITradeIntent = {
      action: "Sell",
      reason: "Profit Taking",
      priceBTC: 60000,
    };

    await act(async () => {
      const updatedPortfolio = await result.current.addTrade(tradeIntent);
      expect(updatedPortfolio?.pnl).toBeGreaterThan(0); // NLP must be positive to make a profit
    });
  });
});
