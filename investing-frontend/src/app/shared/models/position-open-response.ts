export interface PositionOpenResponse {
  id: number;
  name: string;
  symbol: string;
  type: string;
  price: number;
  createdAt: string;
  quantity: number;
  portfolioId: number;
  close: number;
  marketValue: number;
  netProfitLossValue: number;
  netProfitLossPercentage: number;
  dailyProfitLoss: number;
}
