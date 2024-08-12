import React, { useState } from "react";

interface CustomStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const exampleStrategy = `Buy(BTC) if (50-day MA > 200-day MA)
Sell(BTC) if (50-day MA < 200-day MA)`;

const CustomStrategyModal: React.FC<CustomStrategyModalProps> = ({ isOpen, onClose }) => {
  const [prompt, setPrompt] = useState(exampleStrategy);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const nonEditablePrompt = `if (50-day MA > 200-day MA) { buy(Bitcoin); }`;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-base-300 p-4 rounded shadow-lg w-1/2">
        <h2 className="text-xl font-bold mb-4 text-primary">Create a custom strategy</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-500 mb-2">
            Enter your strategy prompt:
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            value={prompt}
            onChange={handlePromptChange}
          />
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Example:</h3>
          <p className="text-sm text-slate-500">
            "Create a strategy that buys Bitcoin when the 50-day moving average crosses above the 200-day moving average."
          </p>
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Non-editable:</h3>
          <p className="text-sm text-slate-500">
            This section is non-editable. It is needed to execute the buy/sell orders of the strategy.
          </p>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
            value={nonEditablePrompt}
          />
        </div>
        <div className="flex justify-around">
          <button onClick={onClose} className="mt-4 bg-slate-500 text-white py-2 px-4 rounded">
            Cancel
          </button>
          <button onClick={onClose} className="mt-4 bg-primary text-white py-2 px-4 rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomStrategyModal;