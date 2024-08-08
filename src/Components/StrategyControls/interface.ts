export interface ITradeIntent {
  value: string;
  assetFrom: string;
  assetTo: string;
  reason: string;
}

export interface IStrategy {
  title: string;
  description: string;
}