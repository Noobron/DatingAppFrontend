// Import Angular packages
import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';

// Import other dependencies
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Import Services
import { AccountService } from '../_services/account.service';
import { NotificationService } from '../_services/notifcation.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private accountService: AccountService,
    private notify: NotificationService
  ) {}

  canActivate(): Observable<boolean> {
    return this.accountService.authenticate$.pipe(
      map((account) => {
        if (account) return true;
        this.notify.notifyWarning('You need to be logged in first.');
        return false;
      })
    );
  }
}
