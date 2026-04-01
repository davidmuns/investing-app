export interface PositionResponse {
  id: number;
  name: string;
  symbol: string;
  type: string;
  fee: number;
  price: number;
  createdAt: string;
  quantity: number;
  portfolioId: number;
  close: number;
  previousClose: number;
  netAmount: number;
  grossAmount: number;
}
