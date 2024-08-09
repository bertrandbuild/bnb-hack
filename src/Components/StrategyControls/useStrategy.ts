import { useState } from "react";
import toast from "react-hot-toast";
import { uploadToIpfs } from "../../utils/ipfs";
import { ChatMessage } from "../Chat/interface";
import { IS_DEV } from "../../utils/constant";
import { ITradeIntent } from "./interface";
import useScreenshot from "./useScreenshot";
import useChat from "../Chat/useChat";
import { useGlobalContext } from "../../context/globalContext";
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
`

const useStrategy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { requestHash, llmResult, setLlmResult, startChatWithImage } = useChat();
  const { portfolio, updateContext } = useGlobalContext();
  const { addTrade, calculatePortfolioValueAndPNL } = usePortfolio();

  // TODO: add prompt + trade history + strategy from context
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
            - **Action**: Return response ACTION = BUY
        - **Sell Signal**:
            - **Action**: Return response ACTION = HOLD (since no position to sell)
    - **Trade in Progress**:
        - **New Buy Signal**:
            - **Condition**: New buy signal detected.
            - **Action**: Return response ACTION = BUY
        - **New Sell Signal**:
            - **Condition**: New sell signal detected.
            - **Action**: Return response ACTION = SELL
        - **Old Signal**:
            - **Condition**: No new signal detected.
            - **Action**: Return response ACTION = HOLD

### CURRENT STATUS

- **Action Options**: \`Buy\` | \`Sell\` | \`Hold\`
- **Current Portfolio**: ${portfolio.currentQuoteSize} USDC | ${portfolio.totalBtc} BTC

### RESPONSE FORMAT

- **Format** (maximum 300 characters):

\`\`\`markdown
ACTION: I want to swap {value} {assetFrom} to {assetTo} BTC
REASON: \${Explain why you made this decision}
\`\`\`
  `;

  const { takeTradingViewScreenshot, setScreenshot } = useScreenshot();

  const runStrategyProd = async () => {
    const { blob } = await takeTradingViewScreenshot();
    const ipfsHash = await uploadToIpfs(blob);
    const llmResponse = await startChatWithImage(ipfsHash, prompt);
    setLlmResult(llmResponse);

    const tradeIntent = handleIntent(llmResponse?.content);

    if (!tradeIntent) {
      setIsLoading(false);
      return;
    }
    const { value, assetFrom, assetTo } = tradeIntent;

    try {
      // TODO: execute trade
      // await executeSwap({from: assetFrom, to: assetTo, value});
      // TODO: update context with new portfolio values
      const newPortfolio = await addTrade(tradeIntent);
      const { currentQuoteSize, pnl, totalBtc, totalUsd } = await calculatePortfolioValueAndPNL(newPortfolio);
      updateContext('portfolio', { ...newPortfolio, currentQuoteSize, pnl, totalBtc, totalUsd });

      console.log('wip: execute PROD swap : ', value, assetFrom, assetTo);
      setIsLoading(false);
    } catch (error) {
      console.error("Error during swap process", error);
      toast.error("An error occurred during the swap process.");
      setIsLoading(false);
    }
  }

  // Dev mode : simulate a llm response and do not upload the image + do not execute the swap
  const runStrategyDev = async () => {
    const { screenshotUrl } = await takeTradingViewScreenshot();
    setScreenshot(screenshotUrl); // display image for testing, can be removed
    
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const llmResponse: ChatMessage = {
      content: templateLLMResponse,
      role: "assistant",
      transactionHash: "0x0"
    };
    setLlmResult(llmResponse);

    const tradeIntent = handleIntent(llmResponse?.content);

    if (!tradeIntent) {
      setIsLoading(false);
      return;
    }

    const newPortfolio = await addTrade(tradeIntent);
    const { currentQuoteSize, pnl, totalBtc, totalUsd } = await calculatePortfolioValueAndPNL(newPortfolio);
    updateContext('portfolio', { ...newPortfolio, currentQuoteSize, pnl, totalBtc, totalUsd });

    toast.success("Swap completed successfully!");
  }

  // Detect a swap intent from a llm response
  const handleIntent = (text: string): ITradeIntent | null => {
    // MATCH the pattern : **ACTION** or **ACTION:** or ACTION: I want to swap {value} {assetFrom} to {assetTo}
    // REASON: {explanation}
    const actionRegex = /(?:\*\*ACTION\*\*|ACTION:|\*\*ACTION:\*\*)\s*I want to swap\s+(\d+)\s+(\w+)\s+to\s+(\w+)\s*(?:\.\s*|\s*)(?:\n|\r\n)(?:\*\*REASON\*\*|REASON:|\*\*REASON:\*\*)\s*(.*?)(?:\.\s*|\s*$)/;
    const match = text.match(actionRegex);
    
    if (!match) {
      console.error("No match found for the action regex.");
      return null;
    }
    
    const value = match[1];
    const assetFrom = match[2];
    const assetTo = match[3];
    const reason = match[4];
    
    return { value, assetFrom, assetTo, reason };
  }

  const runStrategy = async () => {
    try {
      setIsLoading(true);
      await (IS_DEV ? runStrategyDev() : runStrategyProd());
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      toast.error('An unknown error occurred');
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    requestHash,
    llmResult,
    runStrategy
  };
};

export default useStrategy;