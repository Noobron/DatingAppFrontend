// Import Angular packages
import { Injectable } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';

// Import Services
import { UserService } from './user/user-api.service';

// Import other dependencies
import { BehaviorSubject } from 'rxjs';
import { last, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  public progressSource = new BehaviorSubject<number>(0);

  constructor(private userService: UserService) {}

  upload(file: File) {
    let formData = new FormData();
    formData.append('image', file);

    return this.userService.addPhoto(formData, true).pipe(
      map((event) => this.getEventMessage(event, file)),
      tap((envelope: any) => this.processProgress(envelope)),
      last()
    );
  }

  processProgress(envelope: any): void {
    if (typeof envelope === 'number') {
      this.progressSource.next(envelope);
    }
  }

  private getEventMessage(event: HttpEvent<any>, file: File) {
    switch (event.type) {
      case HttpEventType.Sent:
        return `Uploading file "${file.name}" of size ${file.size}.`;
      case HttpEventType.UploadProgress:
        return event.total ? Math.round((100 * event.loaded) / event.total) : 0;
      case HttpEventType.Response:
        this.progressSource.next(0);
        return `File "${file.name}" is successfully uploaded!`;
      default:
        return `File "${file.name}" surprising upload event: ${event.type}.`;
    }
  }
}
