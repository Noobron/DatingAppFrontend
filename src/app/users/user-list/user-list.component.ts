// Import Angular packages
import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';

// Import Components
import { User } from 'src/app/models/user';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { AccountApiService } from 'src/app/services/account/account-api.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  private offest = 0;
  private batchSize = 6;

  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;

  currentPosition = 0;

  // number of Users which are going to be viewed
  viewUserCount = 3;

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
    private accountApiService: AccountApiService
  ) {
    this.accountApiService.authenticate$.subscribe(() => {
      this.getNextUserBatch();
    });
  }

  ngOnInit(): void {}

  // retrieve next batch of users from database using API
  getNextUserBatch() {
    this.userService
      .getUsers(this.offest, this.batchSize)
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
      this.getNextUserBatch();
  }
}
