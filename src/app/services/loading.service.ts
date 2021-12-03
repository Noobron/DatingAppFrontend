// Import Angular packages
import { Injectable } from '@angular/core';

// Import other dependencies
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  busyRequestCount = 0;

  constructor(private spinnerService: NgxSpinnerService) {}

  loading() {
    this.busyRequestCount++;

    this.spinnerService.show(undefined, {
      type: 'ball-spin-clockwise',
      size: 'medium',
      bdColor: 'rgba(51,51,51,0.8)',
      color: 'rgb(155, 122, 213)',
    });
  }

  idle() {
    this.busyRequestCount--;
    if (this.busyRequestCount <= 0) {
      this.busyRequestCount = 0;
      this.spinnerService.hide();
    }
  }
}
