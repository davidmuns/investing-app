import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Login } from '@app/shared/models/login';
import { User } from '@app/shared/models/user';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient) {}

  public signupUser(user: User): Observable<any> {
    user.email = user.email?.trim();
    user.nombreUsuario = user.nombreUsuario?.trim();
    user.password = user.password.trim();
    return this.httpClient.post<any>(environment.HEROKU_BASE_URL + 'auth/nuevo', user);
  }

  public loginUser(login: Login): Observable<any> {
    // ¿Encriptar password del lado del cliente?
    // https://www.youtube.com/watch?v=fzwkkZp5WcE
    // console.log(CryptoJS.AES.encrypt(login.password, 'pass').toString());
    login.nombreUsuario = login.nombreUsuario.trim();
    login.password = login.password.trim();
    return this.httpClient.post<any>(environment.HEROKU_BASE_URL + 'auth/login', login);
  }
}
