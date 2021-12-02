// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import Models
import { Account } from './_models/account';

// Import Services
import { AccountManagerService } from './_services/account/account-manager.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'The Dating App';
  users: any;

  constructor(private accountManagerService: AccountManagerService) {}

  setCurrentAccount() {
    // Get current logged in user if present
    const user: Account | null = this.accountManagerService.getCurrentAccount();
    this.accountManagerService.setCurrentAccount(user);
  }

  ngOnInit(): void {
    this.setCurrentAccount();
  }
}
