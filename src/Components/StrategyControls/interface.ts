export interface ITradeIntent {
  value: string;
  assetFrom: string;
  assetTo: string;
  reason: string;
}

export interface IStrategy {
  title: string;
  imgUrl: string;
  type: string; // a global description ie: "Conservative"
  description: string; // the content of the strategy
}