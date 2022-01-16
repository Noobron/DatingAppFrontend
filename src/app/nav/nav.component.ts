// Import Angular packages
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Import Models
import { User } from '../models/user';

// Import Services
import { AccountApiService } from '../services/account/account-api.service';
import { AccountManagerService } from '../services/account/account-manager.service';
import { UserService } from '../services/user/user-api.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  public user: User | null = null;

  private isLoggedIn = false;

  constructor(
    public accountManagerService: AccountManagerService,
    private accountApiService: AccountApiService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.accountManagerService.currentAccount$.subscribe((acc) => {
      if (acc) {
        this.userService.getUser(acc.username).subscribe((res) => {
          this.user = res;
        });

        this.isLoggedIn = true;
      } else {
        if (this.isLoggedIn)
          this.router.navigate(['/']).then(() => {
            window.location.reload();
          });

        this.user = null;
      }
    });
  }

  logout() {
    this.accountApiService.logout();
  }
}
