import { useState } from "react";
import toast from "react-hot-toast";
import { uploadToIpfs } from "../../utils/ipfs";
import { ChatMessage } from "../Chat/interface";
import { IS_DEV } from "../../utils/constant";
import { ITradeIntent } from "./interface";
import useScreenshot from "./useScreenshot";
import useChat from "../Chat/useChat";

const usdcAmount = 100;
const bnbAmount = 0;

// TODO: add prompt + trade history + strategy from context
const prompt = `You are an asset manager. 
I actually have : ${usdcAmount} USDC and ${bnbAmount} BNB
Do a technical analysis of the chart and provide a recommendation on whether to buy, sell, or hold. 
If we should buy or sell, always follow this format : ACTION: I want to swap {value} {assetFrom} to {assetTo} on Binance Smart Chain`;

const templateLLMResponse = `
Looking at the provided chart for Binance Coin (BNB) against USDT, it shows current data points and indicators that can guide our decision:

Price Movement: BNB has been recently showing an upward trend, as indicated by the rally from around $320 USD to around $488 USD.

Volume: There is a noticeable volume during the price increase, which supports the reliability of the trend.

Moving Average: The price is currently above the Simple Moving Average (SMA) 9 close (537.3), which could indicate a positive momentum. It suggests the market could be bullish in the short term.

Relative Strength Index (RSI): The RSI is at 33.80, which is closer to the lower end of the range but still above the typical 'oversold' threshold of 30. This suggests that there is room for upward movement before the asset becomes overbought.

Recommendation:
Based on the technical analysis, BNB is witnessing a bullish phase with support from both volume indicators and price action consistently remaining above the short-term moving average. Although the RSI is on the lower side indicating the asset is not overbought yet, one should watch for any sudden movements or changes.

However, considering the upward trend and the relatively low level of RSI, it may be a good opportunity to invest in BNB due to potential further price appreciation.

Suggested Action:
ACTION: I want to swap 100 USDC to BNB on Binance Smart Chain.

This action is based on the analysis and the bullish signals from the chart. However, always consider your personal financial situation or consult with a financial advisor to tailor decisions to your individual investment goals and risk tolerance.
`

const useStrategy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { requestHash, llmResult, setLlmResult, startChatWithImage } = useChat();

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
      // await executeSwap({from: assetFrom, to: assetTo, value});
      // TODO: update context with new portfolio values
      console.log('wip: execute PROD swap : ', value, assetFrom, assetTo)
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

    const { value, assetFrom, assetTo } = tradeIntent;

    // TODO: update context with new portfolio values
    console.log("DEV Swap completed successfully : ", value, assetFrom, assetTo);
    toast.success("Swap completed successfully!");
  }

  // Detect a swap intent from a llm response
  const handleIntent = (text: string): ITradeIntent | null => {
    // MATCH the pattern : **ACTION:** or **ACTION:** or **ACTION:** or **ACTION:**
    const actionRegex = /(?:\*\*ACTION:\*\*|ACTION:)\s*I want to swap\s+(\d+)\s+(\w+)\s+to\s+(\w+)\s+on\s+Binance\s+Smart\s+Chain/;
    const match = text.match(actionRegex);
    
    if (!match) {
      console.error("No match found for the action regex.");
      return null;
    }
    
    const value = match[1];
    const assetFrom = match[2];
    const assetTo = match[3];
    
    return {value, assetFrom, assetTo}
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