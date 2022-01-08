// Import Angular packages
import { Component, OnInit, ViewChild } from '@angular/core';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';
import { AccountManagerService } from 'src/app/services/account/account-manager.service';

// Import Components
import { SlickCarouselComponent } from 'ngx-slick-carousel';

// Import Models
import { UserParams } from 'src/app/models/userParams';
import { User } from 'src/app/models/user';
import { AccountApiService } from 'src/app/services/account/account-api.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  private offest = 0;
  private batchSize = 6;

  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  isLoggedIn = false;

  currentPosition = 0;

  // number of Users which are going to be viewed
  viewUserCount = 3;

  defaultMinimumAge = 18;
  defaultMaximumAge = 99;
  defaultGender = '';

  filterOptions = new UserParams(
    this.defaultMinimumAge,
    this.defaultMaximumAge,
    this.defaultGender
  );

  userList: (User | null)[] = [];

  slideConfig = {
    slidesToShow: this.viewUserCount,
    slidesToScroll: this.viewUserCount,
    draggable: false,
    infinite: false,
    waitForAnimate: false,
    arrows: false,
  };

  constructor(
    private userService: UserService,
    private accountManagerService: AccountManagerService,
    private accountApiSerice: AccountApiService
  ) {
    this.accountApiSerice.authenticate$.subscribe(() => {
      this.accountManagerService.currentAccount$.subscribe((acc) => {
        if (acc) {
          this.isLoggedIn = true;
          this.userService.getUser(acc.username).subscribe((res) => {
            this.defaultGender =
              res.gender === 'male'
                ? 'female'
                : res.gender === 'female'
                ? 'male'
                : '';
            this.filterOptions.gender = this.defaultGender;
            this.getNextUserBatch(true);
          });
        } else {
          this.isLoggedIn = false;
          this.getNextUserBatch();
        }
      });
    });
  }

  ngOnInit(): void {}

  // apply new filters on demand
  applyFilters() {
    if (this.filterOptions.minAge < this.defaultMinimumAge)
      this.filterOptions.minAge = this.defaultMinimumAge;

    if (this.filterOptions.maxAge > this.defaultMaximumAge)
      this.filterOptions.maxAge = this.defaultMaximumAge;

    this.getNextUserBatch(true, true);
  }

  // reset filter options
  resetFilters() {
    if (
      this.filterOptions.maxAge !== this.defaultMaximumAge ||
      this.filterOptions.minAge !== this.defaultMinimumAge ||
      this.filterOptions.gender !== this.defaultGender
    ) {
      this.filterOptions = new UserParams(
        this.defaultMinimumAge,
        this.defaultMaximumAge,
        this.defaultGender
      );

      this.getNextUserBatch(true, true);
    }
  }

  // retrieve next batch of users from database using API
  getNextUserBatch(applyfilters: boolean = false, resetData: boolean = false) {
    if (resetData) {
      this.offest = 0;
      this.currentPosition = 0;
      this.userList = [];
      this.slickModal.slides = [];
    }

    this.userService
      .getUsers(
        this.offest,
        this.batchSize,
        applyfilters ? this.filterOptions : null
      )
      .subscribe((response) => {
        if (response !== []) this.userList.push(...response);
        this.offest += this.batchSize;
      });
  }

  // view previous slot of users
  goLeft() {
    this.currentPosition = Math.max(
      this.currentPosition - this.viewUserCount,
      0
    );

    this.slickModal.slickGoTo(this.currentPosition);
  }

  // view next slot of users
  goRight() {
    this.currentPosition = Math.min(
      this.userList.length - 1,
      this.currentPosition + this.viewUserCount
    );

    if (this.userList.length - this.currentPosition + 1 < this.viewUserCount)
      for (
        let pos = this.userList.length - this.currentPosition;
        pos < this.viewUserCount;
        pos++
      )
        this.userList.push(null);

    this.slickModal.slickGoTo(this.currentPosition);

    if (this.currentPosition + this.viewUserCount >= this.offest)
      this.getNextUserBatch(true);
  }
}
