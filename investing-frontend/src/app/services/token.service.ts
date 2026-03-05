import { Injectable } from '@angular/core';

const TOKEN_KEY: string = 'AuthToken';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor() {}

  public setToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }
}
