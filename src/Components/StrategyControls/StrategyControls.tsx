import React from "react";
import { Link as RouterLink } from "react-router-dom";

// import global context
import { useGlobalContext } from "../../context/globalContext";
import useStrategy from "./useStrategy";
import useScreenshot from "./useScreenshot";
import Message from "../Chat/Message";
import Loading from "../ui/Loading";
import PortfolioDetails from "../Portfolio/PortfolioDetails";

const StrategyControls: React.FC<{ handleStartBacktesting: () => void }> = ({ handleStartBacktesting }) => {
  const { strategy } = useGlobalContext();
  const { isLoading, requestHash, llmResult, runStrategy } = useStrategy();
  const { screenshot } = useScreenshot();

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
              <button className="btn btn-primary mb-2" onClick={runStrategy}>
                Start the strategy
              </button>
              <p className="text-xs mt-2 text-neutral text-center">
                The strategy can't be changed after start
              </p>
            </>
          )}
          {screenshot && <img src={screenshot} alt="screenshot" />}
          {isLoading && <Loading />}
          {requestHash && <p className="text-sm mt-6 text-primary text-ellipsis overflow-hidden">Request Hash: {requestHash}</p>}
          {llmResult && <Message message={llmResult} />}
        </div>
        <div className="flex justify-center mt-4">
          <button
            className="btn btn-warning w-full"
            onClick={handleStartBacktesting}
          >
            Start backtesting (-60 days)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyControls;
