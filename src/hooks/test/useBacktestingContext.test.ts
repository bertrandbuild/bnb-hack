import { renderHook } from "@testing-library/react";
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
      Error(
        "useBacktestingContext must be used within a BacktestingProvider"
      )
    );
  });
});
