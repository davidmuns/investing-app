import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { InstrumentRequest } from '@app/shared/models/instrument-request';
import { InstrumentResponse } from '@app/shared/models/instrument-response';
import { SearchResponse } from '@app/shared/models/search-response';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  private apiUrl = environment.BACKEND_BASE_URL + 'api/instruments';
  private externalApiUrl = environment.BACKEND_BASE_URL + 'api/external/instruments';

  constructor(private http: HttpClient) {}

  list(): Observable<SearchResponse<InstrumentResponse>> {
    return this.http.get<SearchResponse<InstrumentResponse>>(this.apiUrl);
  }

  listByPortfolioId(id: number): Observable<SearchResponse<InstrumentResponse>> {
    return this.http.get<SearchResponse<InstrumentResponse>>(this.apiUrl + '/' + id);
  }

  create(req: InstrumentRequest, portfolioId: number): Observable<InstrumentResponse> {
    return this.http.post<InstrumentResponse>(this.apiUrl + '/' + portfolioId, req);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }

  search(query: string): Observable<SearchResponse<InstrumentResponse>> {
    return this.http.get<SearchResponse<InstrumentResponse>>(`${this.externalApiUrl}/search?q=${query}`);
  }

  searchQuote(query: string): Observable<InstrumentResponse> {
    return this.http.get<InstrumentResponse>(`${this.externalApiUrl}/search-quote?q=${query}`);
  }
}
