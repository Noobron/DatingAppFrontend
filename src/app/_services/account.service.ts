// Import Angular packages
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Import other necessary packages
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

// Import other dependencies
import { environment } from '../../environments/environment';
import { API_Paths } from '../api/paths';
import { Account } from '../_models/account';
import { Token } from '../_models/token';

// Import Services
import { TokenService } from './token.service';
import { NotificationService } from './notifcation.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseurl: string = environment.API_URL;
  private currentAccount: Account | null = null;

  // RxJS Subject for observing and emitting Account object
  private currentAccountSource = new ReplaySubject<Account>(1);
  currentAccount$ = this.currentAccountSource.asObservable();

  isAuthenticated = new Observable((observer: Observer<any>) => {
    if (!this.tokenService.isRefreshTokenExpired()) {
      this.http
        .post<{ access: string }>(this.baseurl + API_Paths.loginRefresh, {
          refresh: this.tokenService.getRefreshToken(),
        })
        .subscribe(
          (response) => {
            const access_token: {
              user_id: string;
              username: string;
              exp: string;
            } = jwt_decode(response.access);

            let account = {
              userid: access_token.user_id,
              username: access_token.username,
            };

            this.setCurrentAccount(account);

            observer.next(true);

            this.tokenService.setAccessToken(
              response.access,
              new Date(parseInt(access_token.exp) * 1000)
            );
          },
          (error) => {
            this.logout();
            observer.next(false);
          }
        );
    } else {
      this.logout();
      observer.next(false);
    }
  });

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private notify: NotificationService
  ) {
    // login the last user if refresh token is valid
    this.isAuthenticated.subscribe();
  }

  // make HTTP POST request to backend using it's API to login as a user
  login(model: { username: string; password: string }) {
    return this.http.post<Token>(this.baseurl + API_Paths.login, model).pipe(
      map((response: Token) => {
        const access_token: { user_id: string; username: string; exp: string } =
          jwt_decode(response.access);

        const refresh_token: {
          user_id: string;
          username: string;
          exp: string;
        } = jwt_decode(response.refresh);

        const account: Account = {
          userid: access_token.user_id,
          username: access_token.username,
        };

        if (account) {
          this.currentAccount = account;
          this.tokenService.setAccessToken(
            response.access,
            new Date(parseInt(access_token.exp) * 1000)
          );
          this.tokenService.setRefreshToken(
            response.refresh,
            new Date(parseInt(refresh_token.exp) * 1000)
          );
          this.currentAccountSource.next(account);
        }
      })
    );
  }

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

  // remove Account object and tokens from local storage associated with current user account
  logout() {
    this.tokenService.removeAccessToken();
    this.tokenService.removeRefreshToken();
    this.currentAccountSource.next();
  }

  // make HTTP POST request to backend using it's API to register new user
  register(model: any) {
    return this.http.post<any>(this.baseurl + API_Paths.register, model).pipe(
      tap((response: any) => {
        const data = { username: model.username, password: model.password };
        this.login(data).subscribe();
      }),
      catchError((error) => {
        this.notify.notifyError('Error in Registration', error.error.detail);
        throw error;
      })
    );
  }
}
