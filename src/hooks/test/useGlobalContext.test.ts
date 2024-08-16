import { renderHook, act } from "@testing-library/react";
import { useGlobalContext } from "../useGlobalContext";
import { GlobalProvider } from "../../context/globalContext";
import { IPortfolio } from "../../components/portfolio/interface";
import { loadAllFromLocalStorage } from "../../utils/localStorage";

// Mock the loadAllFromLocalStorage function
jest.mock("../../utils/localStorage", () => ({
  loadAllFromLocalStorage: jest.fn(),
}));

describe("useGlobalContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the initial context values", () => {
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

  it("should update the context when updateContext is called", () => {
    const { result } = renderHook(() => useGlobalContext(), {
      wrapper: GlobalProvider,
    });

    act(() => {
      result.current.updateContext("userAddress", "0x123456789");
    });

    expect(result.current.userAddress).toBe("0x123456789");
  });

  it("should initialize context from localStorage", () => {
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

    // Vérifiez que les valeurs sont correctement initialisées à partir du localStorage
    expect(result.current.userAddress).toBe(mockLoadedState.userAddress);
    expect(result.current.strategy).toEqual(mockLoadedState.strategy);
    expect(result.current.portfolio).toEqual(mockPortfolio);
  });
});
