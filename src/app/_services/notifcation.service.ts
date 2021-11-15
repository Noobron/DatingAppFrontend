// Import Angular packages
import { Injectable } from '@angular/core';

// Import Services
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) {}

  notifySuccess(title: string, message: string = '') {
    this.toastr.success(message, title);
  }

  notifyError(title: string, message: string = '') {
    this.toastr.error(message, title);
  }

  notifyWarning(title: string, message: string = '') {
    this.toastr.warning(message, title);
  }
}
