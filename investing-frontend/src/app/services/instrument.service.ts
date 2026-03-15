import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Instrument } from '@app/shared/models/instrument';
import { SearchResponse } from '@app/shared/models/search-response';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class InstrumentService {
  private apiUrl = environment.BACKEND_BASE_URL + 'api/instruments';

  constructor(private http: HttpClient) {}

  list(): Observable<SearchResponse<Instrument>> {
    return this.http.get<SearchResponse<Instrument>>(this.apiUrl);
  }

  search(query: string): Observable<SearchResponse<Instrument>> {
    return this.http.get<SearchResponse<Instrument>>(`${this.apiUrl}/search?q=${query}`);
  }
}
