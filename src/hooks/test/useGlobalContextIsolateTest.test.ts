import { renderHook, act } from "@testing-library/react";
import { useGlobalContext } from "../useGlobalContext";
import { GlobalProvider } from "../../context/globalContext";

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

  it("Should handle circular updates gracefully", () => {
    jest.resetModules(); 

    jest.isolateModules(() => {
      // Creating an isolated mock for localStorage
      const localStorageMock = (() => {
        let store: { [key: string]: string } = {};
        return {
          getItem: (key: string): string | null => store[key] || null,
          setItem: (key: string, value: string) =>
            (store[key] = value.toString()),
          removeItem: (key: string) => delete store[key],
          clear: () => (store = {}),
        };
      })();

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });

      // Cleaning theStorage room before starting the test
      localStorage.clear();

      const { result } = renderHook(() => useGlobalContext(), {
        wrapper: GlobalProvider,
      });

      // Verification of initial state
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

      // Context updates
      act(() => {
        result.current.updateContext("userAddress", "0x123456789");
        result.current.updateContext("strategy", { name: "Strategy A" });
      });

      // Check that updates have been applied correctly
      expect(result.current.userAddress).toBe("0x123456789");
      expect(result.current.strategy).toEqual({ name: "Strategy A" });

      // Verification that the portfolio has not been affected
      expect(result.current.portfolio).toEqual({
        initialQuoteSize: 0,
        currentQuoteSize: 0,
        pnl: 0,
        totalBtc: 0,
        totalUsd: 0,
        trades: [],
        tradeInProgress: null,
      });

      // Check that values are correctly persisted in localStorage
      expect(localStorage.getItem("userAddress")).toBe(
        JSON.stringify("0x123456789")
      );
      expect(localStorage.getItem("strategy")).toBe(
        JSON.stringify({ name: "Strategy A" })
      );

      // Make sure console.error has not been called
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
    });
  });
});
