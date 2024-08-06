import React from "react";

const TradeHistory: React.FC = () => {
  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
      <h2 className="font-semibold mb-2">Trade History</h2>
      <div className="overflow-x-auto border-t pt-2 text-sm text-gray-600">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Nb</th>
              <th>Pair</th>
              <th>Action</th>
              <th>Amount</th>
              <th>Reason</th>
            </tr>{" "}
          </thead>
          <tbody>
            {/* row */}
            <tr className="bg-base-200">
              <th>1</th>
              <td>BTC/USD</td>
              <td>BUY</td>
              <td>100</td>
              <td>Cross MA...</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
