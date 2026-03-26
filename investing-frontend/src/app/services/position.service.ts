import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PositionRequest } from '@app/shared/models/position-request';
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
}
