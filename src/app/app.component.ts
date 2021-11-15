// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import Models
import { Account } from './_models/account';

// Import Services
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

  setCurrentAccount() {
    // Get current logged in user if present
    const user: Account | null = this.accountService.getCurrentAccount();
    this.accountService.setCurrentAccount(user);
  }

  ngOnInit(): void {
    this.setCurrentAccount();
  }
}
