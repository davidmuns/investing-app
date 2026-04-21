export interface PositionCloseResponse {
  id: number;
  name: string;
  symbol: string;
  openeddAt: string;
  type: string;
  quantity: number;
  entryPrice: number;
  closeddAt: string;
  closedPrice: number;
  profitLossPercentage: number;
  profitLoss: number;
  portfolioId: number;
}
