import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Instrument } from '@app/shared/models/instrument';
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

  list(): Observable<SearchResponse<Instrument>> {
    return this.http.get<SearchResponse<Instrument>>(this.apiUrl);
  }

  create(req: InstrumentRequest): Observable<InstrumentResponse> {
    return this.http.post<InstrumentResponse>(this.apiUrl, req);
  }

  deleteById(id: number): Observable<void> {
    return this.http.delete<void>(this.apiUrl + '/' + id);
  }

  search(query: string): Observable<SearchResponse<Instrument>> {
    return this.http.get<SearchResponse<Instrument>>(`${this.externalApiUrl}/search?q=${query}`);
  }
}
