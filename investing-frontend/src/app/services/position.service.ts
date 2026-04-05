import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PositionCloseResponse } from '@app/shared/models/position-close-response';
import { PositionRequest } from '@app/shared/models/position-request';
import { PositionResponse } from '@app/shared/models/position-response';
import { PositionSummaryResponse } from '@app/shared/models/position-summary-response';
import { SearchResponse } from '@app/shared/models/search-response';
import { UpdatePositionRequest } from '@app/shared/models/update-position-request';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PositionService {
  private apiUrl = environment.BACKEND_BASE_URL + 'api/positions';

  constructor(private http: HttpClient) {}

  create(req: PositionRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl + '/' + req.portfolioId, req);
  }

  listByPortfolioId(id: number): Observable<SearchResponse<PositionResponse>> {
    return this.http.get<SearchResponse<PositionResponse>>(this.apiUrl + '/' + id);
  }

  listSummaryByPortfolioId(id: number): Observable<SearchResponse<PositionSummaryResponse>> {
    return this.http.get<SearchResponse<PositionSummaryResponse>>(this.apiUrl + '/' + id + '/summary');
  }

  close(req: UpdatePositionRequest): Observable<PositionCloseResponse> {
    return this.http.put<PositionCloseResponse>(this.apiUrl, req);
  }

  update(payload: UpdatePositionRequest): Observable<void> {
    return this.http.patch<void>(this.apiUrl, payload);
  }
}
