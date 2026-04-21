export interface PositionRequest {
  name: string;
  symbol: string;
  type: string | undefined;
  fee: number;
  exchange: string;
  price: number;
  date: string;
  quantity: number;
  portfolioId: number;
}
