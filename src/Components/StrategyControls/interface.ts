export interface ITradeIntent {
  value: string;
  assetFrom: string;
  assetTo: string;
  reason: string;
  priceBTC: number;
}

export interface IStrategy {
  title: string;
  description: string;
}