import { renderHook } from "@testing-library/react";
import useTradeIntent from "../useTradeIntent";

describe("useTradeIntent hook", () => {
  it("Should return null if action is HOLD", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text = "**ACTION:** HOLD\n**REASON:** Market is stable";
    const intent = result.current.handleIntent(text);
    expect(intent).toBeNull();
  });

  it("Should return correct trade intent for BUY action", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $35,000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });
  
  it("Should return correct trade intent for BUY action without markdown notation ('**')", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "ACTION: BUY\nREASON: Bullish trend\nBTC PRICE: $35,000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });
  
  it("Should return correct trade intent for BUY action with double new line", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n\n**REASON:** Bullish trend\n\nBTC PRICE: $35,000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should return correct trade intent for SELL action", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text =
      "**ACTION:** SELL\n**REASON:** Bearish trend\nBTC PRICE: $28,000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "SELL",
      reason: "Bearish trend",
      priceBTC: 28000,
    });
  });

  it("Should correctly parse BTC price with commas and periods", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $45,000.00";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 45000,
    });
  });

  it("Should correctly parse BTC price with commas and periods with new line", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $45,000.00\n";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 45000,
    });
  });

  it("Should return null if no valid action is detected", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text = "Invalid text without any actionable content";
    const intent = result.current.handleIntent(text);

    expect(intent).toBeNull();
  });

  it("Should return null for empty or undefined input", () => {
    const { result } = renderHook(() => useTradeIntent());

    const intent = result.current.handleIntent("");

    expect(intent).toBeNull();
  });

  it("Should return null if BTC price is not found", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text = "**ACTION:** BUY\n**REASON:** Bullish trend";
    const intent = result.current.handleIntent(text);

    expect(intent).toBeNull();
  });

  it("Should handle multiple actions and return the first valid intent", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $35,000\n**ACTION:** SELL\n**REASON:** Change of mind";
    const intent = result.current.handleIntent(text);

    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("should ignore irrelevant content and extract valid trade intent", () => {
    const { result } = renderHook(() => useTradeIntent());

    const text =
      "Some random text...\n**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $32,500\nMore random text...";
    const intent = result.current.handleIntent(text);

    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 32500,
    });
  });

  it("Should handle BTC price without a dollar sign", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text = "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: 35000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with commas as thousand separators", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $35,000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with periods as thousand separators (European style)", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: 35.000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with spaces as thousand separators", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: 35 000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with decimal points", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $35,000.50";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with currency symbol after the amount", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: 35000$";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle BTC price with unexpected prefixes or suffixes", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: approx. $35,000 USD";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });

  it("Should handle common typographical errors in BTC price", () => {
    const { result } = renderHook(() => useTradeIntent());
    const text =
      "**ACTION:** BUY\n**REASON:** Bullish trend\nBTC PRICE: $3 5000";
    const intent = result.current.handleIntent(text);
    expect(intent).toEqual({
      action: "BUY",
      reason: "Bullish trend",
      priceBTC: 35000,
    });
  });
});
