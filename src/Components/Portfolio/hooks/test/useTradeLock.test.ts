import { renderHook } from "@testing-library/react";
import useTradeLock from "../useTradeLock";

describe("useTradeLock", () => {
  it("Should lock the trade successfully", async () => {
    const { result } = renderHook(() => useTradeLock());

    // Lock the trade
    const isLocked = result.current.lockTrade();

    expect(isLocked).toBe(true);
  });

  it("Should prevent locking if already locked", async () => {
    const { result } = renderHook(() => useTradeLock());

    // Lock the trade first
    result.current.lockTrade();

    // Try to lock again
    const isLockedAgain = result.current.lockTrade();

    expect(isLockedAgain).toBe(false);
  });

  it("Should unlock the trade and allow re-locking", () => {
    const { result } = renderHook(() => useTradeLock());

    // Lock the trade
    result.current.lockTrade();

    // Unlock the trade
    result.current.unlockTrade();

    // Try to lock again
    const isLockedAgain = result.current.lockTrade();

    expect(isLockedAgain).toBe(true);
  });

  it("Should allow locking after unlocking", () => {
    const { result } = renderHook(() => useTradeLock());

    // Lock the trade
    result.current.lockTrade();

    // Unlock the trade
    result.current.unlockTrade();

    // Lock the trade again
    const isLocked = result.current.lockTrade();

    expect(isLocked).toBe(true);
  });
});
