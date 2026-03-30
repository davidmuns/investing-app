export interface PositionSummaryResponse {
  id: number;
  name: string;
  symbol: string;
  type: string;
  totalQuantity: number;
  averagePrice: number;
  currentPrice: number;
  marketValue: number;
  dailyProfitLoss: number;
  // dailyProfitLossPercentage: number;
  netProfitLossPercentage: number;
  netProfitLoss: number;
  portfolioId: number;
}
