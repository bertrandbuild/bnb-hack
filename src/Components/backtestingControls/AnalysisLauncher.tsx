import React, { useState, useEffect } from "react";
import { backtestingChartes } from "../../utils/backtestingChartes";
import useStrategy from "../StrategyControls/useStrategy";

// import components
import Loading from "../ui/Loading";
import Message from "../chat/Message";

interface AnalysisLauncherProps {
  analysisCount: number; // Number of analyses to be performed
}

const AnalysisLauncher: React.FC<AnalysisLauncherProps> = ({
  analysisCount,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const { runStrategy, isLoading, requestHash, llmResult } = useStrategy();

  // Retrieve the latest items from backtestingCharts based on analysisCount
  useEffect(() => {
    const dataToAnalyze = backtestingChartes.slice(-analysisCount).reverse();
    setSelectedData(dataToAnalyze);
  }, [analysisCount]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);

    for (let i = 0; i < analysisCount; i++) {
      try {
        await runStrategy([selectedData[i]]);
      } catch (error) {
        console.error(`Error during analysis ${i + 1}:`, error);
        break; // Stop further analysis if an error occurs
      }
    }

    setIsAnalyzing(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-neutral">Start analysis</h2>
      <p className="text-lg mb-4 text-neutral">
        Number of analyses to be performed:{" "}
        <strong className="text-blue-500">{analysisCount}</strong>
      </p>
      <button
        onClick={handleStartAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {isAnalyzing ? "Analysis in progress..." : "Start analysis"}
      </button>
      {isLoading && <Loading />}
      {requestHash && (
        <p className="text-sm mt-6 text-primary text-ellipsis overflow-hidden">
          Request Hash: {requestHash}
        </p>
      )}
      {llmResult && <Message message={llmResult} />}
    </div>
  );
};

export default AnalysisLauncher;
