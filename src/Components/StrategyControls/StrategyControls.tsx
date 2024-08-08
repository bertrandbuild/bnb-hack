import React from "react";
import { Link as RouterLink } from "react-router-dom";

// import global context
import { useGlobalContext } from "../../context/globalContext";
import useStrategy from "./useStrategy";
import useScreenshot from "./useScreenshot";
import Message from "../Chat/Message";
import Loading from "../ui/Loading";

const StrategyControls: React.FC = () => {
  const { strategy, portfolio, portfolioValue, pnl, totalBtc, totalUsd } = useGlobalContext();
  const { isLoading, requestHash, llmResult, runStrategy } = useStrategy();
  const {screenshot} = useScreenshot();

  return (
    <div className="w-1/3">
      <div className="bg-gray-100 p-4 rounded-lg shadow-inner mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-secondary">Initial {portfolio.initialQuoteSize} USDC</span>
          <span className="text-secondary">Current {portfolioValue} USDC</span>
          <span className="text-secondary">{pnl > 0 ? '+' : ''}{pnl.toFixed(2)} PNL</span>
          <span className="text-secondary">${totalUsd} USD - {totalBtc} BTC</span>
        </div>
        <div className="text-center my-4">
          <p className="font-semibold text-primary">{strategy?.title}</p>
          <RouterLink to="/">
            <button className="btn text-blue-500 underline text-sm">
              change strategy
            </button>
          </RouterLink>
        </div>
        <div className="flex justify-center items-center flex-col mt-4">
          {!isLoading && 
            <>
              <button className="btn btn-primary mb-2" onClick={runStrategy}>
                Start the strategy
              </button>
              <p className="text-xs text-gray-400 mt-2 text-neutral">
                The strategy can't be changed after start
              </p>
            </>
          }
          {screenshot && <img src={screenshot} alt="screenshot" />}
          {isLoading && <Loading />}
          {requestHash && <p>Request Hash: {requestHash}</p>}
          {llmResult && <Message message={llmResult} />}
        </div>
      </div>
    </div>
  );
};

export default StrategyControls;
