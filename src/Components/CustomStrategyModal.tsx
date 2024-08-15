import React, { useState } from "react";
import Markdown from "react-markdown";
import { useAccount, useSwitchChain } from "wagmi";
import { BUCKET_NAME, GREEN_CHAIN_ID } from "../config/env";
import { uploadToGreenfield } from "../services/bnbGreenfieldService";
import { IStrategy } from "./StrategyControls/interface";
import { v4 as uuidV4 } from "uuid";
import toast from "react-hot-toast";
import Loading from "./ui/Loading";

interface CustomStrategyModalProps {
  isOpen: boolean;
  onClose: (strategy?: IStrategy) => void;
}

const exampleStrategy = `**YOU ARE AN ASSET MANAGER**
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
          - **Action**: Return response ACTION = HOLD`;

const nonEditablePrompt = `### CURRENT STATUS
- **Action Options**: \`Buy\` | \`Sell\` | \`Hold\`
- **Current Portfolio**: \${currentQuoteSize} USDC | \${totalBtc} BTC
- **Trade Status**: \${tradeStatus}

### RESPONSE FORMAT  
- **Format** (maximum 300 characters):
\`\`\`markdown
ACTION: {Action Options}
REASON: {Explain why you made this decision}
BTC PRICE: {BTC price}
\`\`\``;

const CustomStrategyModal: React.FC<CustomStrategyModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState(exampleStrategy);
  const [imgUrl, setImgUrl] = useState("");
  const [title, setTitle] = useState("");
  const { chain, address, connector, isConnected } = useAccount();
  const { switchChain } = useSwitchChain();
  const isOnGreenfield = chain?.id === GREEN_CHAIN_ID;
  const [isLoading, setIsLoading] = useState(false);
  
  const switchToGreenfieldNetwork = () => {
    if (!isOnGreenfield && switchChain) {
      switchChain({ chainId: GREEN_CHAIN_ID });
    }
  }

  const uploadStrategy = async () => {
    setIsLoading(true);
    const strategy: IStrategy = {
      title: title,
      imgUrl: imgUrl,
      type: "custom",
      description: `${prompt}
      ${nonEditablePrompt}`
    };
    if (!connector) {
      console.error("Connector is not available");
      return;
    }
    const newName = `${uuidV4()}.json`;
    const newFile = new File([JSON.stringify(strategy)], newName, { type: "application/json" });
    try {
      await uploadToGreenfield(String(address), connector, { bucketName: BUCKET_NAME, objectName: newName, file: newFile });
      toast.success("Strategy uploaded successfully");
      onClose(strategy);
    } catch (error) {
      console.error(error);
      toast.error("Error uploading strategy");
    } finally {
      setIsLoading(false);
      onClose();
    }
  }

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleImgUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImgUrl(e.target.value);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50 overflow-y-auto pt-32"
      onClick={handleOverlayClick}
    >
      <div className="bg-base-300 p-4 rounded shadow-lg w-1/2 mt-36 mb-8">
        <h2 className="text-xl font-bold mb-4 text-primary">Create a custom strategy</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Enter strategy title:
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={title}
            onChange={handleTitleChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Enter image URL:
          </label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={imgUrl}
            onChange={handleImgUrlChange}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Enter your strategy prompt:
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={8}
            value={prompt}
            onChange={handlePromptChange}
          />
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Example:</h3>
          <p className="text-sm text-slate-500">
            The current example creates a strategy that buys Bitcoin when the 50-day moving average crosses above the 200-day moving average and sells when the 200-day moving average crosses below the 50-day moving average.
          </p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Non-editable:</h3>
          <p className="text-sm text-slate-500">
            This section is non-editable. It is needed to execute the buy/sell orders of the strategy.
          </p>
          <Markdown
            className="w-full p-2 border border-gray-300 rounded"
          >
            {nonEditablePrompt}
          </Markdown>
        </div>
        <div className="flex justify-around items-center mt-4">
          <button onClick={() => onClose()} className="bg-slate-500 text-white py-2 px-4 rounded">
            Cancel
          </button>
          {!isConnected  ? (
            <w3m-button />
          ):(
            isOnGreenfield ? (
              (isLoading ? ( <Loading />):(
                <button onClick={uploadStrategy} className="mt-4 bg-primary text-white py-2 px-4 rounded">
                Upload strategy
                </button>
              ))
            ) : (
              <button onClick={switchToGreenfieldNetwork} className="mt-4 bg-primary text-white py-2 px-4 rounded">
              Switch to Greenfield
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomStrategyModal;