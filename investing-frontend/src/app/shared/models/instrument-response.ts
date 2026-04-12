export interface InstrumentResponse {
  id: number;
  name: string;
  symbol: string;
  type: string;
  exchange: string;
  open: number;
  close: number;
  high: number;
  low: number;
  change: number;
  percentChange: number;
  portfolioId: number;
}
