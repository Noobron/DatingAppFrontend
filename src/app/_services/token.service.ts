// Import Angular packages
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private accessTokenExpiryTime: Date | null = null;

  private accessToken: string | null = null;

  private refreshTokenValidity: boolean = false;

  constructor() {}

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

  // check whether refresh token cookie is valid
  isRefreshTokenValid() {
    return this.refreshTokenValidity;
  }

  // invalidate refresh token cookie
  setRefreshTokenInvalid() {
    this.refreshTokenValidity = false;
  }

  // validate refresh token cookie
  setRefreshTokenValid() {
    this.refreshTokenValidity = true;
  }
}
