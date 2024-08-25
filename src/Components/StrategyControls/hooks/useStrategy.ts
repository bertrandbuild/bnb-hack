import { useState } from "react";
import toast from "react-hot-toast";
import { ChatMessage } from "../../chat/interface";
import { IS_DEV } from "../../../config/env";

// Import Services
import useIpfsService from "../services/useIpfsService";

// Import hooks
import usePortfolio from "../../portfolio/hooks/usePortfolio";
import usePortfolioCalculations from "../../portfolio/hooks/usePortfolioCalculations";
import useScreenshot from "./useScreenshot";
import useTradeIntent from "./useTradeIntent";
import useLlmInteraction from "./useLlmInteraction";
import useChat from "../../chat/hooks/useChat";

// Import context
import { useGlobalContext } from "../../../hooks/useGlobalContext";

const templateLLMResponse = `
Looking at the provided chart for Bitcoin (BTC) against USDT, it shows current data points and indicators that can guide our decision:

Price Movement: BTC has been recently showing an upward trend, as indicated by the rally from around $320 USD to around $488 USD.

Volume: There is a noticeable volume during the price increase, which supports the reliability of the trend.

Moving Average: The price is currently above the Simple Moving Average (SMA) 9 close (537.3), which could indicate a positive momentum. It suggests the market could be bullish in the short term.

Relative Strength Index (RSI): The RSI is at 33.80, which is closer to the lower end of the range but still above the typical 'oversold' threshold of 30. This suggests that there is room for upward movement before the asset becomes overbought.

Recommendation:
Based on the technical analysis, BTC is witnessing a bullish phase with support from both volume indicators and price action consistently remaining above the short-term moving average. Although the RSI is on the lower side indicating the asset is not overbought yet, one should watch for any sudden movements or changes.

However, considering the upward trend and the relatively low level of RSI, it may be a good opportunity to invest in BTC due to potential further price appreciation.

Suggested Action:
ACTION: I want to swap 100 USDC to BTC.
REASON: The bullish signals from the chart suggest a good opportunity to invest in BTC due to potential further price appreciation.

This action is based on the analysis and the bullish signals from the chart. However, always consider your personal financial situation or consult with a financial advisor to tailor decisions to your individual investment goals and risk tolerance.
`;

const useStrategy = () => {
  const { uploadToIpfsFromBlobs, uploadToIpfsFromImages } = useIpfsService();
  const { takeTradingViewScreenshot, setScreenshot } = useScreenshot();
  const { strategy, updateContext, portfolio } = useGlobalContext();
  const { calculatePortfolioAndPNL } = usePortfolioCalculations();
  const { addTrade, unlockTrade } = usePortfolio();
  const { requestHash, llmResult, setLlmResult } = useChat();
  const [isLoading, setIsLoading] = useState(false);
  const { getLlmResponse } = useLlmInteraction();
  const { handleIntent } = useTradeIntent();

  console.log("Current tradeInProgress:", portfolio.tradeInProgress);
  console.log("portfolio.totalUSD : ", portfolio.totalUsd);
  console.log("portfolio.totalBtc", portfolio.totalBtc);
  console.log("requestHash ; ", requestHash);

  // Capture a screenshot
  const handleBlobs = async (): Promise<Blob[]> => {
    const { blob } = await takeTradingViewScreenshot();

    if (!(blob instanceof Blob)) {
      toast.error("Failed to capture screenshot.");
      throw new Error("Expected Blob instance, got something else.");
    }

    toast.success("Screenshot captured successfully.");
    return [blob];
  };

  // Run the strategy in production mode
  // TODO: add the swap when not in backtesting mode
  const runStrategyProd = async (ipfsHash: string, prompt: string): Promise<void> => {
    // if (!lockTrade()) return; // FIXME: Lock the trade operation

    try {
      const llmResponse = await getLlmResponse(ipfsHash, prompt); // Use getLlmResponse
      setLlmResult(llmResponse); // Set the result back to the state
      const tradeIntent = handleIntent(llmResponse?.content);
      if (tradeIntent === null || tradeIntent.action === "HOLD") return;

      const newPortfolio = await addTrade(tradeIntent);
      if (newPortfolio === null) return;

      toast.success("Trade executed successfully.");
    } catch (error) {
      console.error("Error during swap process", error);
    } finally {
      unlockTrade(); // Ensure the lock is released after the operation
    }
  };

  // Dev mode: simulate a LLM response and do not upload the image + do not execute the swap
  const runStrategyDev = async () => {
    try {
      const { screenshotUrl } = await takeTradingViewScreenshot();
      setScreenshot(screenshotUrl); // Display image for testing, can be removed
      toast.success("Screenshot taken for dev mode.");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const llmResponse: ChatMessage = {
        content: templateLLMResponse,
        role: "assistant",
        transactionHash: "0x0",
      };
      setLlmResult(llmResponse);
      toast.success("Simulated LLM response received.");

      const tradeIntent = handleIntent(llmResponse?.content);

      if (!tradeIntent) {
        toast.error("No valid trade intent found in dev mode.");
        return;
      }

      const newPortfolio = await addTrade(tradeIntent);
      if (newPortfolio === null) return;

      const { currentQuoteSize, pnl, totalBtc, totalUsd } =
        await calculatePortfolioAndPNL(newPortfolio, tradeIntent);
      updateContext("portfolio", {
        ...newPortfolio,
        currentQuoteSize,
        pnl,
        totalBtc,
        totalUsd,
      });

      toast.success("Simulated trade executed successfully in dev mode.");
    } catch (error) {
      console.error("Error during dev mode strategy execution:", error);
      toast.error("An error occurred in dev mode.");
    }
  };

  // Function to interpolate the string
  // ie: replace the ${vars} with the actual value
  const interpolate = (str: string, vars: { [key: string]: string }) => {
    for (const key in vars) {
      str = str.replace(new RegExp(`\\$\\{${key}\\}`, "g"), vars[key]);
    }
    return str;
  };

  const runStrategy = async (urlPaths?: string[]) => {
    if (!strategy) {
      toast.error("No strategy found");
      return;
    }
    const prompt = interpolate(strategy?.description, {
      totalUsd: portfolio.totalUsd.toString(),
      totalBtc: portfolio.totalBtc.toString(),
      tradeStatus: portfolio.tradeInProgress
        ? "Trade in progress"
        : "No trade in progress",
    });

    try {
      setIsLoading(true);

      if (IS_DEV) {
        await runStrategyDev();
      } else {
        let ipfsHashes: string[] = [];

        if (urlPaths && urlPaths.length > 0) {
          // Use past images if provided
          ipfsHashes = await uploadToIpfsFromImages(urlPaths);
        } else {
          // Alternatively, take a screenshot
          const blobs = await handleBlobs();
          ipfsHashes = await uploadToIpfsFromBlobs(blobs);
        }

        if (ipfsHashes.length === 0) {
          throw new Error("No IPFS hash was generated.");
        }

        await runStrategyProd(ipfsHashes[0], prompt);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unknown error occurred during the strategy execution.");
    } finally {
      setIsLoading(false);
      toast.success("Finished running strategy.");
    }
  };

  return {
    isLoading,
    requestHash,
    llmResult,
    runStrategy,
  };
};

export default useStrategy;
