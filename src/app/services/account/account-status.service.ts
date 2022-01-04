// Import Angular Packages
import { Injectable } from '@angular/core';

// Import other dependencies
import { environment } from '../../../environments/environment';
import { WEBSOCKET_Paths } from 'src/app/websocket/websocket_paths';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subscription } from 'rxjs';

// Import Services
import { AccountManagerService } from './account-manager.service';
import { TokenService } from '../token.service';

@Injectable({
  providedIn: 'root',
})
export class AccountStatusService {
  private baseurl: string = environment.WEBSOCKET_URL;
  private currentAccountStatusSocket: WebSocketSubject<any> | null = null;
  private subscription: Subscription | null = null;

  constructor(
    private accountManagerService: AccountManagerService,
    private tokenService: TokenService
  ) {
    this.accountManagerService.currentAccount$.subscribe((account) => {
      if (this.currentAccountStatusSocket !== null) {
        this.currentAccountStatusSocket.complete();
        this.subscription?.unsubscribe();
        this.currentAccountStatusSocket = null;
      }

      if (account !== null && !this.tokenService.isAccessTokenExpired()) {
        this.currentAccountStatusSocket = webSocket(
          this.baseurl +
            WEBSOCKET_Paths.userStatus +
            account.username +
            '/?access_token=' +
            this.tokenService.getAccessToken()!
        );

        this.subscription = this.currentAccountStatusSocket.subscribe();
      }
    });
  }

  // Get web socket to check status of an account
  getAccountStatusSocket(username: string) {
    return webSocket<any>(
      this.baseurl + WEBSOCKET_Paths.userStatus + username + '/'
    );
  }
}
