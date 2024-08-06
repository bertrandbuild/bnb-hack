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
              <th>Date</th>
              <th>Coin</th>
              <th>Buy</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Profit/Loss</th>
            </tr>{" "}
          </thead>
          <tbody>
            {/* row */}
            <tr className="bg-base-200">
              <th>1</th>
              <td>10-12-24</td>
              <td>BTC/USD</td>
              <td>100</td>
              <td>50000</td>
              <td>50700</td>
              <td>+700</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TradeHistory;
