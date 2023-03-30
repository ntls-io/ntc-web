import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  constructor(private router: Router) {}
  public getCurrentUser(): any {}
  public removeCurrentUser(): void {
    this.router.navigate(['/auth/login']);
  }

  public setCurrentUser(user: any): void {}
  public isAuhenticated(): boolean {
    return true;
  }
}
