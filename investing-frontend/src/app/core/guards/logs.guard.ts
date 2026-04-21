import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TokenService } from '@app/services/token.service';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class LogsGuard implements CanActivate {
  constructor(
    private readonly tokenSvc: TokenService,
    private router: Router,
  ) {}
  // https://youtu.be/nC-do8ceLWY?list=PL4vWncexIMYvaYdepQvyryGBhIHU-Sd04&t=1501
  canActivate(): boolean | UrlTree {
    return this.tokenSvc.isLogged() || this.router.parseUrl('home');
  }
}
