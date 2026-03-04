import { PortfolioType } from './portfolios-request';

export interface PortfolioResponse {
  id: number;
  name: string;
  type: PortfolioType;
}
