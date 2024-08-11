import React, { useState } from "react";

const StartBacktestingAuto: React.FC = () => {
  const [value, setValue] = useState(5);

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
          max="1319"
          value={value}
          step="1"
          className="range range-xs"
          onChange={handleChangeValue}
        />
        <div className="flex w-full justify-between px-2 text-xs">
          <span className={value >= 0 ? "text-blue-500" : "text-neutral"}>
            0
          </span>
          <span className={value >= 25 ? "text-blue-500" : "text-neutral"}>
            25
          </span>
          <span className={value >= 50 ? "text-blue-500" : "text-neutral"}>
            50
          </span>
          <span className={value >= 75 ? "text-blue-500" : "text-neutral"}>
            75
          </span>
          <span
            className={value >= 1 ? "text-blue-500" : "text-neutral"}
          ></span>
        </div>
      </div>

      {/* Affichage de la valeur actuelle du curseur */}
      <div className="mt-4 text-center text-lg">
        <p className="text-neutral">
          Number of days Backtesting :{" "}
          <span className="font-bold text-blue-500">{value}</span>
        </p>
        <p className="text-neutral">
          Backtesting time :{" "}
          <span className="font-bold text-blue-500">{backtestingTime}</span>
        </p>
      </div>
    </div>
  );
};

export default StartBacktestingAuto;
