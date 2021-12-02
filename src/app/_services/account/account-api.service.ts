// Import Angular packages
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

// Import other necessary packages
import { Observable, Observer, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

// Import other dependencies
import { environment } from '../../../environments/environment';
import { API_Paths } from '../../api/paths';
import { Account } from '../../_models/account';
import { Token } from '../../_models/token';

// Import Services
import { TokenService } from '../token.service';
import { AccountManagerService } from './account-manager.service';

@Injectable({
  providedIn: 'root',
})
export class AccountApiService {
  private baseurl: string = environment.API_URL;

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

        this.tokenService.setAccessToken(
          response.access,
          new Date(parseInt(access_token.exp) * 1000)
        );

        this.accountManagerService.setCurrentAccount(account);

        this.tokenService.setRefreshTokenValid();

        observer.next(true);
      },
      () => {
        this.logout();
        observer.next(false);
      }
    );
  });

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
    private accountManagerService: AccountManagerService
  ) {
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
          this.accountManagerService.setCurrentAccount(account);
          this.tokenService.setRefreshTokenValid();
          this.tokenService.setAccessToken(
            response.access,
            new Date(parseInt(access_token.exp) * 1000)
          );
        }
      })
    );
  }

  // remove Account object and tokens associated with current user account
  logout() {
    this.http.get(environment.API_URL + API_Paths.logout).subscribe(() => {
      this.tokenService.removeAccessToken();
      this.tokenService.setRefreshTokenInvalid();
      this.accountManagerService.removeCurrentAccount();
    });
  }

  // make HTTP POST request to backend using it's API to register new user
  register(model: any) {
    return this.http.post<any>(this.baseurl + API_Paths.register, model).pipe(
      map(() => {
        const data = { username: model.username, password: model.password };
        return this.login(data);
      })
    );
  }
}
