export interface ITradeIntent {
  action: string;
  reason: string;
  priceBTC: number;
}

export interface IStrategy {
  title: string;
  imgUrl: string;
  type: string; // a global description ie: "Conservative"
  description: string; // the content of the strategy
}