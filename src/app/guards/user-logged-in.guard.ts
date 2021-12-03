// Import Angular packages
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

// Import other dependencies
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import Services
import { AccountApiService } from '../services/account/account-api.service';

@Injectable({
  providedIn: 'root',
})
export class UserLoggedInGuard implements CanActivate {
  constructor(private accountApiService: AccountApiService) {}

  canActivate(): Observable<boolean> {
    return this.accountApiService.authenticate$.pipe(
      map((account) => {
        if (account) return false;
        return true;
      })
    );
  }
}
