import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

// import components
import StartBacktestingAuto from "../backtestingControls/StartBacktestingAuto";
import Loading from "../ui/Loading";
import Message from "../Chat/Message";
import PortfolioDetails from "../Portfolio/PortfolioDetails";

// import Hooks
import useStrategy from "./useStrategy";
import useScreenshot from "./useScreenshot";

// import global context
import { useGlobalContext } from "../../context/globalContext";
import { useBacktestingContext } from "../../context/backtestingContext";

const StrategyControls: React.FC = () => {
  const { strategy } = useGlobalContext();
  const { isLoading, requestHash, llmResult, runStrategy } = useStrategy();
  const { screenshot } = useScreenshot();
  const [isBacktesting, setIsBacktesting] = useState(false);
  const { handleStartBacktesting } = useBacktestingContext();

  const handleBacktestingClick = () => {
    setIsBacktesting(true);
    handleStartBacktesting();
  };

  return (
    <div className="w-1/3">
      <div className="bg-gray-100 rounded-lg shadow-inner">
        <PortfolioDetails />
        <div className="text-center my-4">
          <p className="font-semibold text-primary mb-4">{strategy?.title}</p>
          <RouterLink to="/">
            <button className="btn text-blue-500 underline text-sm">
              change strategy
            </button>
          </RouterLink>
        </div>
        <div className="flex justify-center items-center flex-col mt-4">
          {!isLoading && (
            <>
              {isBacktesting ? (
                ""
              ) : (
                <button className="btn btn-primary mb-2" onClick={runStrategy}>
                  {/* TODO Remove btn si start backtesting is true */}
                  Start the strategy
                </button>
              )}
              <p className="text-xs mt-2 text-neutral text-center">
                The strategy can't be changed after start
              </p>
            </>
          )}
          {screenshot && <img src={screenshot} alt="screenshot" />}
          {isLoading && <Loading />}
          {requestHash && (
            <p className="text-sm mt-6 text-primary text-ellipsis overflow-hidden">
              Request Hash: {requestHash}
            </p>
          )}
          {llmResult && <Message message={llmResult} />}
        </div>
        <div className="">
          {/* Code to be absolutely refactored horrible   */}
          {isBacktesting ? <StartBacktestingAuto /> : ""}
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="btn btn-warning w-full"
            onClick={handleBacktestingClick}
          >
            {isBacktesting
              ? "Backtesting in progress..."
              : "Start backtesting (-60 days)"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyControls;
