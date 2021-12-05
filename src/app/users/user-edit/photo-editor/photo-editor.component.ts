import { Component, Input, OnInit } from '@angular/core';
import { Photo } from 'src/app/models/photo';
import { NotificationService } from 'src/app/services/notifcation.service';
import { UserService } from 'src/app/services/user/user-api.service';

@Component({
  selector: 'app-photo-editor',
  templateUrl: './photo-editor.component.html',
  styleUrls: ['./photo-editor.component.css'],
})
export class PhotoEditorComponent implements OnInit {
  @Input()
  images: Photo[] = [];

  constructor(
    private userService: UserService,
    private notify: NotificationService
  ) {}

  ngOnInit(): void {}

  deletePhoto(image: Photo) {
    let index = this.images.findIndex((img) => img.id === image.id);
    this.userService.deletePhoto(image.id).subscribe(() => {
      this.notify.notifySuccess('Success', 'Photo deleted');
      this.images.splice(index, 1);
    });
  }
}
