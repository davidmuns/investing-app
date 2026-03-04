import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { PortfolioRequest } from '@app/shared/models/portfolios-request';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  constructor(private http: HttpClient) {}

  list(): Observable<PortfolioResponse[]> {
    return this.http.get<PortfolioResponse[]>('/api/portfolios');
  }
  create(req: PortfolioRequest): Observable<PortfolioResponse> {
    return this.http.post<PortfolioResponse>('/api/portfolios', req);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`/api/portfolios/${id}`);
  }
  rename(id: number, name: string) {
    return this.http.patch<PortfolioResponse>(`/api/portfolios/${id}/name`, { name });
  }
}
