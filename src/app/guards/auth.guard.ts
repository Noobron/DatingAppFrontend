// Import Angular packages
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// Import other dependencies
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Import Services
import { AccountApiService } from '../services/account/account-api.service';
import { NotificationService } from '../services/notifcation.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountApiService: AccountApiService,
    private router: Router,
    private notifyService: NotificationService
  ) {}

  canActivate(): Observable<boolean> {
    return this.accountApiService.authenticate$
      .pipe(
        map((account) => {
          if (account) return true;
          return false;
        })
      )
      .pipe(
        tap((response) => {
          if (!response) {
            this.notifyService.notifyWarning('', 'Login to access this page');
            this.router.navigate(['/login']);
          }
        })
      );
  }
}
