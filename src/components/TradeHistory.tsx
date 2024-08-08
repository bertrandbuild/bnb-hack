import React from "react";

// import globalContext
import { useGlobalContext } from "../context/globalContext";

const TradeHistory: React.FC = () => {
  const { portfolio } = useGlobalContext();

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
      <h2 className="font-semibold mb-2 text-secondary">Trade History</h2>
      <div className="overflow-x-auto border-t pt-2 text-sm text-gray-600">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th className="text-neutral">Nb</th>
              <th className="text-neutral">Pair</th>
              <th className="text-neutral">Action</th>
              <th className="text-neutral">Amount</th>
              <th className="text-neutral">Reason</th>
            </tr>{" "}
          </thead>
          <tbody>
            {portfolio.trades && portfolio.trades.map((trade) => (
              <tr key={trade.id} className="bg-base-200">
                <th className="text-accent">{trade.id}</th>
                <td className="text-accent">{trade.tokenPair}</td>
                <td className="text-accent">{trade.action}</td>
                <td className="text-accent">{trade.quoteAmount}</td>
                <td className="text-accent">{trade.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
