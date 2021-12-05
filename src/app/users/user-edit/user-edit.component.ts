// Import Angular Packages
import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

// Import other dependencies
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Photo } from 'src/app/models/photo';

// Import Models
import { User } from 'src/app/models/user';

// Import Services
import { AccountManagerService } from 'src/app/services/account/account-manager.service';
import { NotificationService } from 'src/app/services/notifcation.service';
import { UserService } from 'src/app/services/user/user-api.service';

// Import Components
import { UpdateProfileModalComponent } from './update-profile-modal/update-profile-modal.component';

const reg =
  /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
export enum TABS {
  BASIC,
  ABOUT,
  INTERESTS,
  EDIT_PHOTOS,
  ADD_PHOTOS,
}

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
})
export class UserEditComponent implements OnInit {
  user: User | null = null;

  TABS = TABS;

  BASIC: number = 0;
  ABOUT: number = 1;
  INTERESTS: number = 2;
  PHOTOS: number = 3;

  @HostListener('window:beforeunload', ['$event']) unloadNotification(
    $event: any
  ) {
    if (this.model.dirty) {
      $event.returnValue = true;
    }
  }

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

  userImages: Photo[] = [];

  constructor(
    private accountManagerService: AccountManagerService,
    private userService: UserService,
    private notify: NotificationService,
    private _modalService: NgbModal
  ) {
    this.accountManagerService.currentAccount$.subscribe((acc) => {
      this.userService.getUser(acc.username).subscribe((response) => {
        this.user = response;

        this.model.reset();

        let userCopy = { ...this.user };
        const { lastActive, age, username, gender, dateOfBirth, ...temp } =
          userCopy;
        this.model.setValue(temp);

        this.retrieveImages();
      });
    });
  }

  retrieveImages() {
    if (this.user)
      this.userService
        .getUserPhotos(this.user.username)
        .subscribe((response) => {
          this.userImages = response;
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
    this.selectedIndex = TABS.BASIC;
  }

  selectAbout() {
    this.selectedIndex = TABS.ABOUT;
  }

  selectInterests() {
    this.selectedIndex = TABS.INTERESTS;
  }

  selectEditPhotos() {
    this.selectedIndex = TABS.EDIT_PHOTOS;
  }

  selectAddPhotos() {
    this.selectedIndex = TABS.ADD_PHOTOS;
  }

  onSubmit() {
    let data = { ...this.user, ...this.model.value };

    this.userService.saveUserInfo(data).subscribe(
      () => {
        // refresh account details
        this.accountManagerService.setCurrentAccount(
          this.accountManagerService.getCurrentAccount()
        );
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

  open() {
    const modalRef = this._modalService.open(UpdateProfileModalComponent);

    modalRef.componentInstance.profileUrl =
      this.model.controls['mainPhoto'].value;

    modalRef.result.then(
      (res) => {
        if (
          this.model.controls['mainPhoto'].value !==
          modalRef.componentInstance.profileUrl
        ) {
          this.model.controls['mainPhoto'].setValue(
            modalRef.componentInstance.profileUrl
          );
          this.model.markAsDirty();
        }
      },
      () => {}
    );
  }

  removeProfilePhoto() {
    if (this.model.controls['mainPhoto'].value !== '') {
      this.model.controls['mainPhoto'].setValue('');
      this.model.markAsDirty();
    }
  }

  ngOnInit(): void {}
}
