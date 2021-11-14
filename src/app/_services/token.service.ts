import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private accessLabel = 'access';
  private refreshLabel = 'refresh';

  constructor() {}

  // geting access token from storage
  getAccessToken() {
    return localStorage.getItem(this.accessLabel);
  }

  // setting access token from storage
  setAccessToken(accessToken: string) {
    localStorage.setItem(this.accessLabel, accessToken);
  }

  // deleting access token from storage
  removeAccessToken() {
    localStorage.removeItem(this.accessLabel);
  }

  // geting refresh token from storage
  getRefreshToken() {
    return localStorage.getItem(this.refreshLabel);
  }

  // setting refresh token from storage
  setRefreshToken(refreshToken: string) {
    localStorage.setItem(this.refreshLabel, refreshToken);
  }

  // deleting refresh token from storage
  removeRefreshToken() {
    localStorage.removeItem(this.refreshLabel);
  }
}
