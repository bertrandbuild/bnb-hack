import React, { useState, useEffect } from "react";

import AnalysisLauncher from "./AnalysisLauncher";
import { useBacktestingContext } from "../../hooks/useBacktestingContext";

const StartBacktestingAuto: React.FC = () => {
  const { selectedChart } = useBacktestingContext();
  const [value, setValue] = useState(1);

  useEffect(() => {
    setValue(1);
  }, [selectedChart]);

  // Define a conversion factor (for example, each unit of value = 2 minutes)
  const conversionFactor = 1;

  // Calculate backtesting time in minutes or hours
  const calculateBacktestingTime = (value: number) => {
    const totalMinutes = value * conversionFactor;
    if (totalMinutes >= 180) {
      const hours = totalMinutes / 60;
      return `${hours.toFixed(1)} h`; // Round to one decimal place
    } else {
      return `${totalMinutes} min`;
    }
  };

  const backtestingTime = calculateBacktestingTime(value);

  const handleChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value)); // Convert to number
  };

  return (
    // TODO: Refactoring in components range
    <div>
      <div>
        <input
          type="range"
          min={0}
          max={selectedChart.length}
          value={value}
          step="1"
          className="range range-xs"
          onChange={handleChangeValue}
        />
        <div className="flex w-full justify-between px-2 text-xs">
          <span className={value >= 0 ? "text-blue-500" : "text-neutral"}>
            0%
          </span>
          <span className={value >= 25 ? "text-blue-500" : "text-neutral"}>
            25%
          </span>
          <span className={value >= 50 ? "text-blue-500" : "text-neutral"}>
            50%
          </span>
          <span className={value >= 75 ? "text-blue-500" : "text-neutral"}>
            75%
          </span>
          <span
            className={value >= 1 ? "text-blue-500" : "text-neutral"}
          ></span>
        </div>
      </div>

      {/* Display of current cursor value */}
      <div className="mt-4 text-center text-lg">
        <p className="text-neutral">
          Number of backtesting days :{" "}
          <span className="font-bold text-blue-500">{value}</span>
        </p>
        <p className="text-neutral">
          Estimated backtesting time :{" "}
          <span className="font-bold text-blue-500">{backtestingTime}</span>
        </p>
      </div>
      <div>
        {/* Remove analysisCount hard cord add in context value in components  */}
        <AnalysisLauncher analysisCount={value} />
      </div>
    </div>
  );
};

export default StartBacktestingAuto;
