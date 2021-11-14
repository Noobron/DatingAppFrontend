import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Account } from './_models/account';
import { User } from './_models/user';
import { AccountService } from './_services/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'The Dating App';
  users: any;

  constructor(private accountService: AccountService) {}

  setCurrentUser() {
    // Get current logged in user if present
    const user: Account = this.accountService.getCurrentUser();
    this.accountService.setCurrentUser(user);
  }

  ngOnInit(): void {
    this.setCurrentUser();
  }
}
