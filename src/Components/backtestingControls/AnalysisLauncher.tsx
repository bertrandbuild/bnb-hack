import React, { useState, useEffect } from "react";
import useStrategy from "../StrategyControls/hooks/useStrategy";

// import context
import { useBacktestingContext } from "../../hooks/useBacktestingContext";

// import components
import Loading from "../ui/Loading";
import Message from "../chat/Message";

interface AnalysisLauncherProps {
  analysisCount: number; // Number of analyses to be performed
}

const AnalysisLauncher: React.FC<AnalysisLauncherProps> = ({
  analysisCount,
}) => {
  const { selectedChart, setCurrentIndex, useTestChart, toggleChart } = useBacktestingContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedData, setSelectedData] = useState<string[]>([]);
  const { runStrategy, isLoading, requestHash, llmResult } = useStrategy();
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);

  // Retrieve the latest items from backtestingCharts based on analysisCount
  useEffect(() => {
    const dataToAnalyze = selectedChart.slice(-analysisCount);
    setSelectedData(dataToAnalyze);
  }, [analysisCount, selectedChart]);

  useEffect(() => {
    if (isAnalyzing && currentAnalysisIndex < analysisCount) {
      const runNextAnalysis = async () => {
        try {
          await runStrategy([selectedData[currentAnalysisIndex]]);
          setCurrentAnalysisIndex((prev) => {
            const newIndex = prev + 1;
            setCurrentIndex(newIndex);
            return newIndex;
          });
        } catch (error) {
          console.error(
            `Error during analysis ${currentAnalysisIndex + 1}:`,
            error
          );
          setIsAnalyzing(false);
        }
      };

      runNextAnalysis();
    } else if (currentAnalysisIndex >= analysisCount) {
      setIsAnalyzing(false);
      setCurrentAnalysisIndex(0);
    }
  }, [isAnalyzing, currentAnalysisIndex, selectedData, setCurrentIndex]);

  const handleToggleChart = () => {
    setCurrentIndex(0);
    toggleChart();
  };

  return (
    <div className="flex justify-center items-center flex-col mt-4">
      <button
        onClick={() => setIsAnalyzing(!isAnalyzing)}
        className={`btn ${
          isAnalyzing ? "btn-secondary" : "btn-primary"
        } rounded mx-auto mb-2`}
      >
        {isAnalyzing ? "Pause backtesting" : "Start backtesting"}
      </button>
      <div className="btn btn-sm" onClick={handleToggleChart}>
        {useTestChart
          ? "Switch to backtestingCharts"
          : "Switch to fake charts with multiple buy / sell signals"}
      </div>
      {isAnalyzing && (
        <p className="text-sm mt-2 text-primary">
          Analyzing: {currentAnalysisIndex + 1} / {analysisCount}
        </p>
      )}
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