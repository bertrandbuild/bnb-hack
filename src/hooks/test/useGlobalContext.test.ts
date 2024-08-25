import { renderHook, act } from "@testing-library/react";
import { useGlobalContext } from "../useGlobalContext";
import { GlobalProvider } from "../../context/globalContext";
import { IPortfolio } from "../../components/portfolio/interface";
import { loadAllFromLocalStorage } from "../../utils/localStorage";

// Mock the loadAllFromLocalStorage function
jest.mock("../../utils/localStorage", () => ({
  loadAllFromLocalStorage: jest.fn().mockImplementation(() => {
    return {};
  }),
}));

describe("useGlobalContext", () => {
  beforeEach(() => {
    jest.resetModules(); 
    localStorage.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("Should return the initial context values", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    expect(result.current.userAddress).toBeNull();
    expect(result.current.strategy).toBeNull();
    expect(result.current.portfolio).toEqual({
      initialQuoteSize: 0,
      currentQuoteSize: 0,
      pnl: 0,
      totalBtc: 0,
      totalUsd: 0,
      trades: [],
      tradeInProgress: null,
    });
    expect(result.current.updateContext).toBeInstanceOf(Function);
  });

  it("Should update the context when updateContext is called", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x123456789");
    });

    expect(result.current.userAddress).toBe("0x123456789");
  });

  it("Should not update unrelated parts of the context when updateContext is called", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    const initialStrategy = result.current.strategy;

    act(() => {
      result.current.updateContext("userAddress", "0x987654321");
    });

    expect(result.current.strategy).toBe(initialStrategy);
  });

  it("Should handle errors when localStorage is inaccessible", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("LocalStorage error");
    });

    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x987654321");
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to save userAddress to localStorage:"),
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });

  it("Should handle concurrent updates to the context correctly", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x123456789");
      result.current.updateContext("userAddress", "0x987654321");
    });

    expect(result.current.userAddress).toBe("0x987654321");
  });

  it("Should persist context values in localStorage", () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x123456789");
    });

    expect(setItemSpy).toHaveBeenCalledWith(
      "userAddress",
      JSON.stringify("0x123456789")
    );
  });

  it("Should reset the context and clear localStorage", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x123456789");
    });

    act(() => {
      result.current.updateContext("userAddress", null);
    });

    expect(result.current.userAddress).toBeNull();
    expect(localStorage.getItem("userAddress")).toBeNull();
  });

  it("Should not interfere with other context values", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("portfolio", {
        initialQuoteSize: 100,
        currentQuoteSize: 50,
        pnl: 10,
        totalBtc: 1,
        totalUsd: 50000,
        trades: [],
        tradeInProgress: null,
      });
    });

    act(() => {
      result.current.updateContext("strategy", { name: "New Strategy" });
    });

    expect(result.current.portfolio.initialQuoteSize).toBe(100);
    expect(result.current.portfolio.currentQuoteSize).toBe(50);
    expect(result.current.portfolio.pnl).toBe(10);
  });

  it("Should handle multiple rapid updates without performance degradation", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    for (let i = 0; i < 100; i++) {
      act(() => {
        result.current.updateContext("userAddress", `0x${i}`);
      });
    }

    expect(result.current.userAddress).toBe("0x99");
  });

  it("Should initialize context from localStorage", () => {
    const mockPortfolio: IPortfolio = {
      initialQuoteSize: 100,
      currentQuoteSize: 50,
      pnl: 10,
      totalBtc: 1,
      totalUsd: 50000,
      trades: [],
      tradeInProgress: null,
    };
    const mockLoadedState = {
      userAddress: "0xabcdef",
      strategy: {
        name: "Test Strategy",
        title: "",
        imgUrl: "",
        type: "",
        description: "",
      },
      portfolio: mockPortfolio,
    };

    // Mock the localStorage loading
    (loadAllFromLocalStorage as jest.Mock).mockReturnValue(mockLoadedState);

    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    expect(result.current.userAddress).toBe(mockLoadedState.userAddress);
    expect(result.current.strategy).toEqual(mockLoadedState.strategy);
    expect(result.current.portfolio).toEqual(mockPortfolio);
  });
});
