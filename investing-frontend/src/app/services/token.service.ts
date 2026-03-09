import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY: string = 'AuthToken';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  constructor(private router: Router) {}

  public setToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
  }

  public getToken(): string {
    return window.sessionStorage.getItem(TOKEN_KEY) as string;
  }

  public isLogged(): boolean {
    if (this.getToken()) {
      return true;
    }
    return false;
  }

  public getUsername(): string | null {
    if (!this.isLogged()) {
      return null;
    }
    // Obtenemos el payload del token en formato json y extraemos el nombre de usuario
    const username: string = this.getPayload().sub;
    return username;
  }

  public isAdmin(): boolean {
    if (!this.isLogged()) {
      return false;
    }
    // Obtenemos el payload del token en formato json y extraemos los roles
    const roles: string[] = this.getPayload().roles;
    // Comprobamos si el usuario tiene privilegios de administrador
    if (roles.indexOf('ROLE_ADMIN') < 0) {
      return false;
    }
    return true;
  }
  private getPayload() {
    const token = this.getToken();
    // Dividimos el token
    // (eyJhbGciOiJIUzUxMiJ9.
    // eyJzdWIiOiJ1c2VyIiwiaWF0IjoxNjYyMjgwMTUzLCJleHAiOjE2NjIzMTYxNTN9.
    // Mt9kTvyRj5RI_mqnSldLB6TjK1xFOBgPhyUBIzA3EuyiuD5_KrMHLeLLmXDjITy37DBEQKEZdQLyfbaKwBbppw) por los puntos y
    // obtenemos un array de tres elementos de tipo string donde el elemento 1 es el payload codificado que contiene el nombre de usuario
    // y los roles
    const encodedData = token.split('.')[1];
    // Decodificamos la cadena
    const decodedData = window.atob(encodedData);
    // Convertimos data en objeto json
    const payload = JSON.parse(decodedData);
    return payload;
  }
  public logOut(): void {
    window.sessionStorage.clear();
    window.localStorage.clear();
    this.router.navigate(['home']);
  }
}
