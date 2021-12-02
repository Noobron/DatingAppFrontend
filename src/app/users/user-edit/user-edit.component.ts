// Import Angular Packages
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Import other dependencies
import {
  NgxGalleryAnimation,
  NgxGalleryImage,
  NgxGalleryOptions,
} from '@kolkov/ngx-gallery';

// Import Models
import { User } from 'src/app/_models/user';

// Import Services
import { AccountManagerService } from 'src/app/_services/account/account-manager.service';
import { NotificationService } from 'src/app/_services/notifcation.service';
import { UserService } from 'src/app/_services/user.service';

const reg = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  user: User | null = null;

  BASIC: number = 0;
  ABOUT: number = 1;
  INTERESTS: number = 2;
  PHOTOS: number = 3;

  model = new FormGroup({
    firstName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),

    lastName: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
    ]),

    introduction: new FormControl(),

    lookingFor: new FormControl(),

    interests: new FormControl('', [Validators.maxLength(100)]),

    city: new FormControl('', [Validators.maxLength(40)]),

    country: new FormControl('', [Validators.maxLength(40)]),

    mainPhoto: new FormControl('', [Validators.pattern(reg)]),
  });

  public selectedIndex = 0;

  galleryOptions: NgxGalleryOptions[] = [
    {
      width: '500px',
      height: '500px',
      imagePercent: 100,
      thumbnailsColumns: 4,
      imageAnimation: NgxGalleryAnimation.Slide,
    },
  ];

  galleryImages: NgxGalleryImage[] = [];

  constructor(
    private accountManagerService: AccountManagerService,
    private userService: UserService,
    private notify: NotificationService
  ) {
    let account = this.accountManagerService.getCurrentAccount();

    this.userService.getUser(account!.username).subscribe((response) => {
      this.user = response;

      let userCopy = { ...this.user };
      const { lastActive, age, username, gender, dateOfBirth, ...temp } =
        userCopy;
      this.model.setValue(temp);

      this.userService
        .getUserPhotos(this.user.username)
        .subscribe((response) => {
          response.forEach((file) => {
            this.galleryImages.push({
              small: file.image,
              medium: file.image,
              big: file.image,
            });
          });
        });
    });
  }

  reset() {
    if (this.user != null) {
      let userCopy = { ...this.user };
      const { lastActive, age, username, gender, dateOfBirth, ...temp } =
        userCopy;

      this.model.setValue(temp);
    } else this.model.reset();

    this.model.markAsPristine();
  }

  selectBasicInfo() {
    this.selectedIndex = 0;
  }

  selectAbout() {
    this.selectedIndex = 1;
  }

  selectInterests() {
    this.selectedIndex = 2;
  }

  selectPhotos() {
    this.selectedIndex = 3;
  }

  onSubmit() {
    let data = { ...this.user, ...this.model.value };

    this.userService.saveUserInfo(data).subscribe(
      () => {
        this.notify.notifySuccess('Success', 'Profile Updated');
      },
      (error) => {
        if (error.error)
          this.notify.notifyError(
            'Error in updating profile',
            error.error.detail
          );
      }
    );
  }

  ngOnInit(): void {}
}
