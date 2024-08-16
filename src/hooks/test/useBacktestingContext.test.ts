import { renderHook, act } from "@testing-library/react";
import { useBacktestingContext } from "../useBacktestingContext";
import BacktestingProvider from "../../context/backtestingContext";

describe("useBacktestingContext", () => {
  it("Should return the context when used in the BacktestingProvider ", () => {
    const { result } = renderHook(() => useBacktestingContext(), {
      wrapper: BacktestingProvider,
    });

    expect(result.current).toBeDefined();
  });

  it("Should raise an error when used outside the BacktestingProvider", () => {
    const { result } = renderHook(() => {
      try {
        return useBacktestingContext();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toEqual(
      Error("useBacktestingContext must be used within a BacktestingProvider")
    );
  });

  it("Should have correct initial values", () => {
    const { result } = renderHook(() => useBacktestingContext(), {
      wrapper: BacktestingProvider,
    });
  
    expect(result.current.backtesting).toEqual([]);
    expect(result.current.showBacktesting).toBe(false);
    expect(result.current.useTestChart).toBe(false);
    expect(result.current.selectedChart).toBeDefined();
  });

  it("Should toggle showBacktesting state when toggleBacktesting is called", () => {
    const { result } = renderHook(() => useBacktestingContext(), {
      wrapper: BacktestingProvider,
    });
  
    expect(result.current.showBacktesting).toBe(false);
  
    act(() => {
      result.current.toggleBacktesting();
    });
  
    expect(result.current.showBacktesting).toBe(true);
  
    act(() => {
      result.current.toggleBacktesting();
    });
  
    expect(result.current.showBacktesting).toBe(false);
  });

  it("Should toggle useTestChart state when toggleChart is called", () => {
    const { result } = renderHook(() => useBacktestingContext(), {
      wrapper: BacktestingProvider,
    });
  
    expect(result.current.useTestChart).toBe(false);
  
    act(() => {
      result.current.toggleChart();
    });
  
    expect(result.current.useTestChart).toBe(true);
  
    act(() => {
      result.current.toggleChart();
    });
  
    expect(result.current.useTestChart).toBe(false);
  });
});
