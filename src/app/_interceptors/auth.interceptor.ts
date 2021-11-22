// Import Angular packages
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpClient,
} from '@angular/common/http';

// Import dependencies
import { Observable, Observer, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { API_Paths } from '../api/paths';
import { environment } from 'src/environments/environment';
import jwt_decode from 'jwt-decode';

// Import Services
import { TokenService } from '../_services/token.service';
import { NotificationService } from '../_services/notifcation.service';
import { NavigationExtras, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  private refreshUrl: string = environment.API_URL + API_Paths.loginRefresh;

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private notify: NotificationService,
    private router: Router
  ) {}

  // adds access token to the request body if present
  private addToken(request: HttpRequest<any>, token: string | null) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Observer for refershing account; This is re-impleneted apart from `AccountService`
  // inorder to avoid Circular DI due to HTTP Request for refreshing
  refresh$ = new Observable((observer: Observer<boolean>) => {
    if (!this.tokenService.isAccessTokenExpired()) {
      observer.next(true);
      return;
    }

    if (!this.tokenService.isRefreshTokenExpired()) {
      this.http
        .post<{ access: string }>(this.refreshUrl, {
          refresh: this.tokenService.getRefreshToken(),
        })
        .subscribe(
          (response) => {
            const access_token: {
              user_id: string;
              username: string;
              exp: string;
            } = jwt_decode(response.access);

            this.tokenService.setAccessToken(
              response.access,
              new Date(parseInt(access_token.exp) * 1000)
            );

            observer.next(true);
          },
          (error) => {
            observer.next(false);
          }
        );
    } else observer.next(false);
  });

  // handles Unauthorized error (401)
  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
    error: HttpErrorResponse
  ) {
    // check if refresh token is expired
    if (!this.tokenService.isRefreshTokenExpired()) {
      // refresh the token and retry the request
      return this.refresh$.pipe(
        switchMap((response) => {
          if (response)
            request = this.addToken(
              request,
              this.tokenService.getAccessToken()
            );

          return next.handle(request);
        })
      );
    } else {
      this.tokenService.removeRefreshToken();
      this.notify.notifyError('Error', error.error.detail);
      return throwError(error);
    }
  }

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    request = this.addToken(request, this.tokenService.getAccessToken());

    return next.handle(request).pipe(
      catchError((error) => {
        if (error) {
          switch (error.status) {
            case 401:
              return this.handle401Error(request, next, error);

            case 404:
              this.router.navigateByUrl('/not-found');
              break;
            case 500:
              const navtigationExtras: NavigationExtras = {
                state: { error: error.error },
              };
              this.router.navigateByUrl('/server-error', navtigationExtras);
              break;
            case 400:
              let modalStateErrors: string[] = [];

              for (let e in error.error) {
                let message = '';

                for (let m in error.error[e])
                  message += error.error[e][m] + ',';

                modalStateErrors.push(
                  e + ' : ' + message.substring(0, message.length - 1)
                );
              }

              return throwError(modalStateErrors);
            default:
              this.notify.notifyError(
                'Sorry, something went wrong while processing your request'
              );
              break;
          }
        }
        return throwError(error);
      })
    );
  }
}
