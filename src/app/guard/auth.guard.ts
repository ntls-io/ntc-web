import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { SessionQuery } from 'src/app/states/session';
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private sessionQuery: SessionQuery) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const isAuthenticated = this.sessionQuery.isAuthenticated();
    if (isAuthenticated) {
      return true;
    }
    this.router.navigate(['auth', 'login']);
    return false;
  }
}
