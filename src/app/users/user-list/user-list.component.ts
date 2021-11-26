// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import Services
import { UserService } from 'src/app/_services/user.service';

// Import Components
import { User } from 'src/app/_models/user';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent implements OnInit {
  private offest = 0;
  private batchSize = 6;

  currentPosition = 0;

  // number of Users which are going to be viewed
  viewUserCount = 3;

  userList: User[] = [];

  constructor(private userService: UserService) {
    this.getNextUserBatch();
  }
  
  ngOnInit(): void {}

  // retrieve next batch of users from database using API
  getNextUserBatch() {
    this.userService
      .getUsers(this.offest, this.batchSize)
      .subscribe((response) => {
        if (response !== []) this.userList.push(...response);
        console.log(this.userList);
        this.offest += this.batchSize;
      });
  }

  // view previous slot of users
  goLeft() {
    this.currentPosition = Math.max(
      this.currentPosition - this.viewUserCount,
      0
    );

    if (this.currentPosition + this.viewUserCount >= this.offest)
      this.getNextUserBatch();
  }

  // view next slot of users
  goRight() {
    this.currentPosition = Math.min(
      this.userList.length - 1,
      this.currentPosition + this.viewUserCount
    );

    if (this.currentPosition + this.viewUserCount >= this.offest)
      this.getNextUserBatch();
  }
}
