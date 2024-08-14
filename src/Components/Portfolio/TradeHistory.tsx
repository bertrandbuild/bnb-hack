import React from "react";

// import globalContext
import { useGlobalContext } from "../../hooks/useGlobalContext";

const TradeHistory: React.FC = () => {
  const { portfolio } = useGlobalContext();

  return (
    <div className="bg-gray-100 p-4">
      <h2 className="font-bold mb-2 text-secondary">Trade History</h2>
      <div className="pt-2 text-sm">
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
                <th className="bg-gray-100 text-accent">{trade.id}</th>
                <td className="bg-gray-100 text-accent">{trade.tokenPair}</td>
                <td className="bg-gray-100 text-accent">{trade.action}</td>
                <td className="bg-gray-100 text-accent">{trade.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
