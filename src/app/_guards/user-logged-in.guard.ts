// Import Angular packages
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

// Import other dependencies
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import Services
import { AccountService } from '../_services/account.service';

@Injectable({
  providedIn: 'root',
})
export class UserLoggedInGuard implements CanActivate {
  constructor(private accountService: AccountService) {}

  canActivate(): Observable<boolean> {
    return this.accountService.authenticate$
      .pipe(
        map((account) => {
          if (account) return false;
          return true;
        })
      )
     
  }
}
