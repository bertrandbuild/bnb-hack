import React, { useState, useEffect } from "react";
import { backtestingChartes } from "../../utils/backtestingChartes";

interface AnalysisLauncherProps {
  analysisCount: number; // Number of analyses to be performed
}

interface AnalysisResult {
  analysis: number;
  result: string;
}

const AnalysisLauncher: React.FC<AnalysisLauncherProps> = ({
  analysisCount,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [selectedData, setSelectedData] = useState<string[]>([]);

  console.log("analysisCount", analysisCount);

  // Retrieve the latest items from backtestingCharts based on analysisCount
  useEffect(() => {
    const dataToAnalyze = backtestingChartes.slice(-analysisCount).reverse();
    setSelectedData(dataToAnalyze);
  }, [analysisCount]);

  

  console.log("selectedData", selectedData);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < analysisCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const result = {
        analysis: i + 1,
        result: `Analysis results  + ${i + 1}`,
      };
      newResults.push(result);
    }

    setResults(newResults);
    setIsAnalyzing(false);
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 text-neutral">Start analysis</h2>
      <p className="text-lg mb-4 text-neutral">
      Number of analyses to be performed: <strong className="text-blue-500">{analysisCount}</strong>
      </p>
      <button
        onClick={handleStartAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {isAnalyzing ? "Analysis in progress..." : "Start analysis"}
      </button>
      {results.length > 0 && (
        <div className="results mt-4">
          <h3 className="text-lg mb-4 text-neutral">
          Analysis results:
          </h3>
          <ul>
            {results.map((result, index) => (
              <li className="text-lg mb-4 text-neutral" key={index}>
                {result.result}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AnalysisLauncher;
