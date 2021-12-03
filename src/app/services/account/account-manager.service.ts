// Import Angular packages
import { Injectable } from '@angular/core';

// Import other necessary packages
import { ReplaySubject } from 'rxjs';

// Import other dependencies
import { Account } from '../../models/account';

@Injectable({
  providedIn: 'root',
})
export class AccountManagerService {
  private currentAccount: Account | null = null;

  // RxJS Subject for observing and emitting Account object
  private currentAccountSource = new ReplaySubject<Account>(1);
  currentAccount$ = this.currentAccountSource.asObservable();

  constructor() {}

  // get current Account
  getCurrentAccount() {
    return this.currentAccount;
  }

  // set current Account and emit it using the Subject
  setCurrentAccount(account: Account | null) {
    if (account) {
      this.currentAccount = account;
      this.currentAccountSource.next(account);
    } else this.currentAccountSource.next();
  }

  // remove current account
  removeCurrentAccount() {
    this.currentAccount = null;
    this.currentAccountSource.next();
  }
}
