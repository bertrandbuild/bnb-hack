export interface ITrade {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  action: "Buy" | "Sell";
  token: string;
  baseAmount: number; // Amount in the base currency (e.g., BTC)
  quoteAmount: number; // Amount in the quote currency (e.g., USDT)
  price: number;
  fee: {
    amount: number;
    currency: string;
  };
  status: "Completed" | "Cancelled" | "Pending";
  orderId?: string; // Optional field to link to the original order
  exchange: string; // The exchange where the trade occurred
}

export interface IStrategyTrades {
  strategyHash: string; // FK to strategy (on bnb greenfield)
  userAddress: string; // 0x User Address
  trades: ITrade[];
}

export interface IStrategy {
  title: string;
  description: string;
}

export interface ITradeHistory {
  id: number;
  pair: string;
  action: "Buy" | "Sell";
  amount: number;
  reason: string;
}
