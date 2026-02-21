import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type PortfolioType = 'WATCHLIST' | 'POSITIONS';

export interface PortfolioResponse {
  id: number;
  name: string;
  type: PortfolioType;
}
export interface CreatePortfolioRequest {
  name: string;
  type: PortfolioType;
}

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  constructor(private http: HttpClient) { }

  list(): Observable<PortfolioResponse[]> {
    return this.http.get<PortfolioResponse[]>('/api/portfolios');
  }
  create(req: CreatePortfolioRequest): Observable<PortfolioResponse> {
    return this.http.post<PortfolioResponse>('/api/portfolios', req);
  }
}