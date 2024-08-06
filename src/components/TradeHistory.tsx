import React from "react";

const TradeHistory: React.FC = () => {
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
            {/* row */}
            <tr className="bg-base-200">
              <th className="text-accent">1</th>
              <td className="text-accent">BTC/USD</td>
              <td className="text-accent">BUY</td>
              <td className="text-accent">100</td>
              <td className="text-accent">Cross MA...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
