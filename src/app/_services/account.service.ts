import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import jwt_decode from 'jwt-decode';

import { environment } from '../../environments/environment';
import { API_Paths } from '../api/paths';
import { Account } from '../_models/account';
import { Token } from '../_models/token';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private baseurl: string;
  private accountLabel = 'account';

  // RxJS Subject for observing and emitting Account object
  private currentUserSource = new ReplaySubject<Account>(1);
  currentUser$ = this.currentUserSource.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    this.baseurl = environment.API_URL;
  }

  // make HTTP POST request to backend using it's API to login as a user
  login(model: { username: string; password: string }) {
    return this.http.post<Token>(this.baseurl + API_Paths.login, model).pipe(
      map((response: Token) => {
        const jwt_token: { user_id: string; username: string } = jwt_decode(
          response.access
        );

        const account: Account = {
          userid: jwt_token.user_id,
          username: jwt_token.username,
        };

        if (account) {
          localStorage.setItem(this.accountLabel, JSON.stringify(account));
          this.tokenService.setAccessToken(response.access);
          this.tokenService.setRefreshToken(response.refresh);
          this.currentUserSource.next(account);
        }
      })
    );
  }

  // get current Account from local storage
  getCurrentUser() {
    return JSON.parse(localStorage.getItem(this.accountLabel)!);
  }

  // set current Account and emit it using the Subject
  setCurrentUser(user: Account) {
    this.currentUserSource.next(user);
  }

  // remove Account object and tokens from local storage associated with current user account 
  logout() {
    localStorage.removeItem(this.accountLabel);
    this.tokenService.removeAccessToken();
    this.tokenService.removeRefreshToken();
    this.currentUserSource.next();
  }

  // make HTTP POST request to backend using it's API to register new user
  register(model: any) {
    return this.http.post<any>(this.baseurl + API_Paths.register, model).pipe(
      tap((response: any) => {
        const data = { username: model.username, password: model.password };
        console.log(data);
        this.login(data).subscribe();
      })
    );
  }
}
