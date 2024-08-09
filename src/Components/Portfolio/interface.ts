export interface ITrade {
  id: string;
  timestamp: number; // Unix timestamp in milliseconds
  action: "Buy" | "Sell";
  tokenPair: string; // e.g. "BTC/USDT"
  reason: string; // explanation from the llm to remind
  baseAmount: number; // Amount in the base currency (e.g., BTC)
  quoteAmount: number; // Amount in the quote currency (e.g., USDT)
  price: number;
  status: "Completed" | "Cancelled" | "Pending";
  fee?: {
    amount: number;
    currency: string;
  };
  orderId?: string; // Optional field to link to the original order
  exchange?: string; // The exchange where the trade occurred
}

export interface IPortfolio {
  initialQuoteSize: number;
  currentQuoteSize: number;
  pnl: number;
  totalBtc: number;
  totalUsd: number;
  trades: ITrade[] | [];
}
