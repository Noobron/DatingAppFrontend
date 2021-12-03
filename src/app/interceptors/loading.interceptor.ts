// Import Angular packages
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';

// Import other dependecnies
import { Observable } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';

// Import Services
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  constructor(private loadingService: LoadingService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    this.loadingService.loading();
    return next.handle(request).pipe(
      finalize(() => {
        this.loadingService.idle();
      })
    );
  }
}
