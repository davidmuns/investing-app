import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PortfolioResponse } from '@app/shared/models/portfolios-response';
import { PortfolioRequest } from '@app/shared/models/portfolios-request';
import { environment } from '@env/environment';
import { SearchResponse } from '@app/shared/models/search-response';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private apiUrl = environment.BACKEND_BASE_URL + 'api/portfolios';
  constructor(private http: HttpClient) {}

  list(): Observable<SearchResponse<PortfolioResponse>> {
    return this.http.get<SearchResponse<PortfolioResponse>>(this.apiUrl);
  }

  listByUsername(username: string | null): Observable<SearchResponse<PortfolioResponse>> {
    return this.http.get<SearchResponse<PortfolioResponse>>(`${this.apiUrl}/user/${username}`);
  }
  create(req: PortfolioRequest): Observable<PortfolioResponse> {
    return this.http.post<PortfolioResponse>(this.apiUrl, req);
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + `/${id}`);
  }
  rename(id: number, name: string) {
    return this.http.patch<PortfolioResponse>(this.apiUrl + `/${id}/name`, { name });
  }
  reorder(req: PortfolioRequest[]): Observable<SearchResponse<PortfolioResponse>> {
    return this.http.put<SearchResponse<PortfolioResponse>>(this.apiUrl + '/reorder', req);
  }
}
