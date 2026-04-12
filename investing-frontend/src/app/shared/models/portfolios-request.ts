export type PortfolioType = 'WATCHLIST' | 'POSITIONS';
export interface PortfolioRequest {
  name: string;
  type: PortfolioType;
  displayOrder: number;
}
