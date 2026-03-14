import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { PortfolioRequest } from '@app/shared/models/portfolios-request';
import { environment } from '@env/environment';
import { SearchResponse } from '@app/shared/models/search-response';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  constructor(private http: HttpClient) {}

  list(): Observable<SearchResponse<PortfolioResponse>> {
    return this.http.get<SearchResponse<PortfolioResponse>>(environment.BACKEND_BASE_URL + 'api/portfolios');
  }
  create(req: PortfolioRequest): Observable<PortfolioResponse> {
    return this.http.post<PortfolioResponse>(environment.BACKEND_BASE_URL + 'api/portfolios', req);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(environment.BACKEND_BASE_URL + `api/portfolios/${id}`);
  }
  rename(id: number, name: string) {
    return this.http.patch<PortfolioResponse>(environment.BACKEND_BASE_URL + `api/portfolios/${id}/name`, { name });
  }
}
