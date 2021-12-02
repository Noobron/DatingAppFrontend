// Import Angular packages
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Import Models
import { User } from '../_models/user';

// Import Services
import { AccountApiService } from '../_services/account/account-api.service';
import { AccountManagerService } from '../_services/account/account-manager.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  public user: User | null = null;

  constructor(
    public accountManagerService: AccountManagerService,
    private accountApiService: AccountApiService,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.accountManagerService.currentAccount$.subscribe((acc) => {
      if (acc)
        this.userService.getUser(acc.username).subscribe((res) => {
          this.user = res;
        });
      else this.user = null;
    });
  }

  logout() {
    this.accountApiService.logout();
    this.router.navigateByUrl('/');
  }
}
