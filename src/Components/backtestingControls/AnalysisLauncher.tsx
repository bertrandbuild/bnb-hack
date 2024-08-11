import React, { useState } from "react";

interface AnalysisLauncherProps {
  analysisCount: number; // Nombre d'analyses à effectuer
}

interface AnalysisResult {
  analysis: number;
  result: string;
}

const AnalysisLauncher: React.FC<AnalysisLauncherProps> = ({
  analysisCount,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setCompleted(0);
    const newResults: AnalysisResult[] = [];

    for (let i = 0; i < analysisCount; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCompleted(i + 1);
      const result = {
        analysis: i + 1,
        result: `Résultat de l'analyse  + ${i + 1}`,
      };
      newResults.push(result);
    }

    setResults(newResults);
    setIsAnalyzing(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-neutral">Lancer l'analyse</h2>
      <p className="text-2xl font-bold mb-4 text-neutral">
        Nombre d'analyses à effectuer: <strong>{analysisCount}</strong>
      </p>
      <button
        onClick={handleStartAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-500 text-white p-2 rounded"
      >
        {isAnalyzing ? "Analyse en cours..." : "Lancer l'analyse"}
      </button>
      <div className="progress mt-4">
        {isAnalyzing && (
          <p className="text-2xl font-bold mb-4 text-neutral">
            Analyse {completed}/{analysisCount} en cours...
          </p>
        )}
      </div>
      {results.length > 0 && (
        <div className="results mt-4">
          <h3 className="text-2xl font-bold mb-4 text-neutral">
            Résultats de l'analyse:
          </h3>
          <ul>
            {results.map((result, index) => (
              <li className="text-2xl font-bold mb-4 text-neutral" key={index}>
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
