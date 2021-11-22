// Import Angular packages
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

// Import other dependencies
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

// Import Services
import { AccountService } from '../_services/account.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private accountService: AccountService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.accountService.authenticate$
      .pipe(
        map((account) => {
          if (account) return true;
          return false;
        })
      )
      .pipe(
        tap((response) => {
          if (!response) this.router.navigate(['/login']);
        })
      );
  }

 
}
