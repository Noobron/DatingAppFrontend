// Import Angular packages
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Import other necessary packages
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

// Import other dependencies
import { environment } from '../../environments/environment';
import { API_Paths } from '../api/paths';
import { Account } from '../_models/account';
import { Token } from '../_models/token';

// Import Services
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseurl: string = environment.API_URL;
  private currentAccount: Account | null = null;

  // RxJS Subject for observing and emitting Account object
  private currentAccountSource = new ReplaySubject<Account>(1);
  currentAccount$ = this.currentAccountSource.asObservable();

  // Observable to check if user is authenticated and authenticate user if there is valid refresh token
  authenticate$ = new Observable((observer: Observer<boolean>) => {
    if (!this.tokenService.isAccessTokenExpired()) {
      observer.next(true);
      return;
    }

    this.http.post<Token>(this.baseurl + API_Paths.loginRefresh, {}).subscribe(
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

        this.tokenService.setAccessToken(
          response.access,
          new Date(parseInt(access_token.exp) * 1000)
        );

        this.tokenService.setRefreshTokenValid();

        observer.next(true);
      },
      (error) => {
        this.logout();
        observer.next(false);
      }
    );
  });

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // login the last user if refresh token is valid
    this.authenticate$.subscribe();
  }

  // make HTTP POST request to backend using it's API to login as a user
  login(model: { username: string; password: string }) {
    return this.http.post<Token>(this.baseurl + API_Paths.login, model).pipe(
      map((response: Token) => {
        const access_token: { user_id: string; username: string; exp: string } =
          jwt_decode(response.access);

        const account: Account = {
          userid: access_token.user_id,
          username: access_token.username,
        };

        if (account) {
          this.currentAccount = account;
          this.tokenService.setRefreshTokenValid();
          this.tokenService.setAccessToken(
            response.access,
            new Date(parseInt(access_token.exp) * 1000)
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
    this.http
      .get(environment.API_URL + API_Paths.logout)
      .subscribe((response) => {
        this.tokenService.removeAccessToken();
        this.tokenService.setRefreshTokenInvalid();
        this.currentAccountSource.next();
      });
  }

  // make HTTP POST request to backend using it's API to register new user
  register(model: any) {
    return this.http.post<any>(this.baseurl + API_Paths.register, model).pipe(
      map((response: any) => {
        const data = { username: model.username, password: model.password };
        return this.login(data);
      })
    );
  }
}
