import { useState } from "react";
import toast from "react-hot-toast";
import { uploadToIpfs } from "../../utils/ipfs";
import { uploadUrlToPinata } from "../../utils/pinataUpload";
import { ChatMessage } from "../chat/interface";
import { IS_DEV } from "../../utils/constant";
import { ITradeIntent } from "./interface";
import useScreenshot from "./useScreenshot";
import useChat from "../chat/useChat";
import { useGlobalContext } from "../../hooks//useGlobalContext";
import usePortfolio from "../Portfolio/usePortfolio";

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
  const [isLoading, setIsLoading] = useState(false);
  const { requestHash, llmResult, setLlmResult, startChatWithImage } =
    useChat();
  const { portfolio, updateContext } = useGlobalContext();
  const { addTrade, calculatePortfolioValueAndPNL } = usePortfolio();
  const { takeTradingViewScreenshot, setScreenshot } = useScreenshot();

  // TODO: add prompt + trade history + strategy from context
  const tradeStatus = portfolio.tradeInProgress
    ? "Trade in Progress"
    : "No Trade in Progress";

  console.log("TradeStatus :", tradeStatus);
  console.log("Current tradeInProgress:", portfolio.tradeInProgress);
  console.log("portfolio.totalUSD : ", portfolio.totalUsd)
  console.log("portfolio.totalBtc", portfolio.totalBtc)
  console.log("requestHash ; ", requestHash)

  const prompt = `
  **YOU ARE AN ASSET MANAGER**

### STEP 1: IMAGE ANALYSIS

1. **Technical Analysis**:
    
    - **Indicators**:
        - **50-day Simple Moving Average (SMA)**: Orange line
        - **200-day Exponential Moving Average (EMA)**: Green line
2. **Identify Signals**:
    - **Buy Signal**:
        - **Condition**: The 50-day SMA (orange line) crosses above the 200-day EMA (green line) on the latest candlestick (rightmost candle) for daily chart readings.
        - **Action**: Proceed to Step 2 with the BUY signal.
    - **Sell Signal:**
        - **Condition**: A candlestick crosses below the 200-day EMA (green line) after an initial buy signal, indicating a potential downtrend on the latest candlestick (rightmost candle) for daily charts.
        - **Action**: Proceed to Step 2 with the SELL signal.
    - **Otherwise**:
        - **Action**: Return output: HOLD

### STEP 2: TRADE ANALYSIS

1. **Check Trade Status**:
    - **No Trade in Progress**:
        - **Buy Signal**:
            - **Action**: Return response ACTION = BUY, BTC PRICE = \${BTC price}
        - **Sell Signal**:
            - **Action**: Return response ACTION = HOLD (since no position to sell)
    - **Trade in Progress**:
        - **New Buy Signal**:
            - **Condition**: New buy signal detected.
            - **Action**: Return response ACTION = HOLD (since a trade is already in progress)
        - **New Sell Signal**:
            - **Condition**: New sell signal detected.
            - **Action**: Return response ACTION = SELL, BTC PRICE = \${BTC price}
        - **Hold Signal**:
            - **Condition**: No new signal detected.
            - **Action**: Return response ACTION = HOLD

### CURRENT STATUS

- **Action Options**: \`Buy\` | \`Sell\` | \`Hold\`
- **Current Portfolio**: ${portfolio.totalUsd} USDC | ${portfolio.totalBtc} BTC
- **Trade Status**: ${tradeStatus}

### RESPONSE FORMAT

- **Format** (maximum 300 characters):

\`\`\`markdown
ACTION: \${Action Options}
REASON: \${Explain why you made this decision}
BTC PRICE: \${BTC price}
\`\`\`
  `;

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

  // Manage images
  const handleImages = async (urlPaths: string[]): Promise<string[]> => {
    toast.success("Images handled successfully.");
    console.log("image du signal : ", urlPaths);
    return urlPaths; // Returning paths as they are since they are already paths
  };

  // Upload Blobs to IPFS
  const uploadToIpfsFromBlobs = async (blobs: Blob[]): Promise<string[]> => {
    const ipfsHashes: string[] = [];
    for (const blob of blobs) {
      try {
        const ipfsHash = await uploadToIpfs(blob);
        ipfsHashes.push(ipfsHash);
        toast.success("Image uploaded to IPFS successfully.");
      } catch (error) {
        toast.error("Failed to upload image to IPFS.");
        console.error("Error uploading blob to IPFS:", error);
        throw error;
      }
    }
    return ipfsHashes;
  };

  // Upload images to IPFS
  const uploadToIpfsFromImages = async (
    urlPaths: string[]
  ): Promise<string[]> => {
    const ipfsHashes: string[] = [];

    for (const urlPath of urlPaths) {
      try {
        const ipfsHash = (await uploadUrlToPinata(urlPath)).IpfsHash;
        ipfsHashes.push(ipfsHash);
        toast.success(`Image ${urlPath} uploaded to IPFS successfully.`);
      } catch (error) {
        toast.error(`Failed to upload image ${urlPath} to IPFS.`);
        console.error(`Error uploading image ${urlPath}:`, error);
        throw new Error(`Upload failed for ${urlPath}`);
      }
    }
    return ipfsHashes;
  };

  // Run the strategy in production mode
  const runStrategyProd = async (ipfsHash: string): Promise<void> => {
    const llmResponse = await startChatWithImage(ipfsHash, prompt);

    setLlmResult(llmResponse);
    toast.success("Received response from LLM.");

    const tradeIntent = handleIntent(llmResponse?.content);

    if (tradeIntent === null) return;

    if (!tradeIntent) {
      toast.error("No valid trade intent found.");
      return;
    }

    // TODO: execute trade
    // await executeSwap({from: assetFrom, to: assetTo, value});
    // TODO: update context with new portfolio values

    // If the signal is "Hold", do not change the state of `tradeInProgress`.
    if (tradeIntent.action === "HOLD") {
      console.log(
        "Signal is HOLD, no trade will be executed, maintaining current trade status."
      );
      return; // Do not execute trade, keep `tradeInProgress` status unchanged
    }

    // Checking `tradeInProgress` before executing the trade
    if (
      portfolio.tradeInProgress &&
      portfolio.tradeInProgress.action === "Buy" &&
      tradeIntent.action === "BUY"
    ) {
      console.warn(
        "A BUY trade is already in progress. New BUY trade will not be executed."
      );
      return; // Prevents the execution of another purchase trade
    }

    try {
      // Checking funds before executing the trade
      if (portfolio.tradeInProgress) {
        console.warn("Trade in progress detected:", portfolio.tradeInProgress);
        if (
          portfolio.tradeInProgress.action === "Buy" &&
          tradeIntent.action === "BUY"
        ) {
          console.warn(
            "A BUY trade is already in progress. Cannot add another BUY trade."
          );
          return;
        }
      }

      const newPortfolio = await addTrade(tradeIntent);

      if (newPortfolio === null) return;

      const { currentQuoteSize, pnl, totalBtc, totalUsd } =
        await calculatePortfolioValueAndPNL(newPortfolio, tradeIntent);
      updateContext("portfolio", {
        ...newPortfolio,
        currentQuoteSize,
        pnl,
        totalBtc,
        totalUsd,
      });

      toast.success("Trade executed successfully.");
    } catch (error) {
      console.error("Error during swap process", error);
    }
  };

  // Dev mode : simulate a llm response and do not upload the image + do not execute the swap
  const runStrategyDev = async () => {
    try {
      const { screenshotUrl } = await takeTradingViewScreenshot();
      setScreenshot(screenshotUrl); // display image for testing, can be removed
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
        await calculatePortfolioValueAndPNL(newPortfolio, tradeIntent);
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

  // Detect a swap intent from a llm response
  const handleIntent = (text: string): ITradeIntent | null => {
    const holdRegex = /HOLD|\*\*HOLD\*\*/g;
    const holdMatch = text.match(holdRegex);

    if (holdMatch) {
      return null;
    }

    // MATCH the pattern : **ACTION** or **ACTION:** or ACTION: I want to swap {value} {assetFrom} to {assetTo}
    // REASON: {explanation}
    const actionRegex =
      /(?:\*\*ACTION\*\*|ACTION:|\*\*ACTION:\*\*)\s*(BUY|SELL|HOLD)\s*(?:\n|\r\n|\r)(?:\*\*REASON\*\*|REASON:|\*\*REASON:\*\*)\s*([^\n\r]*)/i;
    const match = text.match(actionRegex);

    const priceBTCRegex = /BTC PRICE:\s*\$?\d{1,3}(?:[,.]\d{3})*(?:\.\d{2})?/i;
    const matchPriceBTC = text.match(priceBTCRegex);

    if (!match || !matchPriceBTC) {
      console.error("No match found for the action regex.");
      return null;
    }

    const action = match[1];
    const reason = match[2];

    // Price cleanup to remove commas and periods before converting to integers
    let priceBTC = matchPriceBTC[0];
    priceBTC = priceBTC.replace(/BTC PRICE:\s*\$?/, "").replace(/,/g, ""); // Remove commas and periods

    console.log("value", action);
    console.log("reason", reason);
    console.log("priceBTC", priceBTC);

    return { action, reason, priceBTC: parseInt(priceBTC) };
  };

  const runStrategy = async (urlPaths?: string[]) => {
    try {
      setIsLoading(true);

      if (IS_DEV) {
        await runStrategyDev();
      } else {
        let ipfsHashes: string[] = [];

        if (urlPaths && urlPaths.length > 0) {
          // Use past images if provided
          const handledImages = await handleImages(urlPaths);
          ipfsHashes = await uploadToIpfsFromImages(handledImages);
        } else {
          // Alternatively, take a screenshot
          const blobs = await handleBlobs();
          ipfsHashes = await uploadToIpfsFromBlobs(blobs);
        }

        // Ensure that at least one IPFS hash has been generated
        if (ipfsHashes.length === 0) {
          throw new Error("No IPFS hash was generated.");
        }

        // Run the strategy in production with the first IPFS hash
        await runStrategyProd(ipfsHashes[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unknown error occurred during the strategy execution.");
      setIsLoading(false);
    } finally {
      toast.success("Finished running strategy.");
      setIsLoading(false);
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
