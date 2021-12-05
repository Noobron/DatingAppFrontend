// Import Angulaar packages
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';

// Import Services
import { ImageUploadService } from 'src/app/services/image-upload.service';
import { NotificationService } from 'src/app/services/notifcation.service';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css'],
})
export class ImageUploadComponent implements OnInit {
  progress: number = 0;
  infoMessage: any;
  isUploading: boolean = false;
  file: File | null = null;
  fileValid: boolean = false;
  fileName: string = 'No file selected';
  fileValidError = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  @Output()
  refresh = new EventEmitter();

  constructor(
    private uploader: ImageUploadService,
    private notify: NotificationService
  ) {}

  ngOnInit() {
    this.uploader.progressSource.subscribe((progress) => {
      this.progress = progress;
    });
  }

  onChange(file: File | null) {
    if (file) {
      let allowed_extensions = new Array('jpg', 'png', 'gif', 'jpeg');

      let file_extension = file.name.split('.').pop();

      for (var i = 0; i < allowed_extensions.length; i++) {
        if (allowed_extensions[i] == file_extension) {
          this.file = file;
          this.fileValidError = false;
          this.fileName = file.name;
          const reader = new FileReader();
          reader.readAsDataURL(file);
          this.fileValid = true;

          return;
        }
      }

      this.fileName = 'No file selected';
      this.fileValid = false;
      this.file = null;

      this.fileInput.nativeElement.value = '';
      this.fileValidError = true;
    }
  }

  onUpload() {
    this.infoMessage = null;
    this.progress = 0;
    this.isUploading = true;

    if (this.file)
      this.uploader.upload(this.file).subscribe(() => {
        this.refresh.emit();
        this.fileInput.nativeElement.value = '';
        this.isUploading = false;
        this.infoMessage = '';
        this.file = null;
        this.fileName = 'No file selected';
        this.notify.notifySuccess('Success', 'Image upload completed');
        this.progress = 0;
        this.fileValid = false;
      });
  }
}
