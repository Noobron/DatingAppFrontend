// Import Angular packages
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private refreshLabel = 'refresh';

  private accessTokenExpiryTime: Date | null = null;
  private refreshTokenExpiryTime: Date | null;

  private accessToken: string | null = null;

  constructor() {
    let refreshObject = this.getRefreshObject();

    if (refreshObject !== null)
      this.refreshTokenExpiryTime = new Date(refreshObject.expiryTime);
    else this.refreshTokenExpiryTime = null;
  }

  // check whether access token is expired
  isAccessTokenExpired() {
    if (
      this.accessTokenExpiryTime !== null &&
      this.accessTokenExpiryTime > new Date()
    )
      return false;
    return true;
  }

  // geting access token
  getAccessToken() {
    return this.accessToken;
  }

  // setting access token
  setAccessToken(accessToken: string, expiryTime: Date) {
    this.accessToken = accessToken;
    this.accessTokenExpiryTime = expiryTime;
  }

  // deleting access token
  removeAccessToken() {
    this.accessToken = null;
    this.accessTokenExpiryTime = null;
  }

  // check whether refresh token is expired
  isRefreshTokenExpired() {
    if (
      this.refreshTokenExpiryTime !== null &&
      this.refreshTokenExpiryTime > new Date()
    )
      return false;
    return true;
  }

  // geting refresh token from storage
  getRefreshToken() {
    return JSON.parse(localStorage.getItem(this.refreshLabel)!).refreshToken;
  }

  // geting refresh object from storage
  getRefreshObject() {
    return JSON.parse(localStorage.getItem(this.refreshLabel)!);
  }

  // setting refresh token from storage
  setRefreshToken(refreshToken: string, expiryTime: Date) {
    this.refreshTokenExpiryTime = expiryTime;

    localStorage.setItem(
      this.refreshLabel,
      JSON.stringify({ refreshToken, expiryTime })
    );
  }

  // deleting refresh token from storage
  removeRefreshToken() {
    this.refreshTokenExpiryTime = null;

    localStorage.removeItem(this.refreshLabel);
  }
}
