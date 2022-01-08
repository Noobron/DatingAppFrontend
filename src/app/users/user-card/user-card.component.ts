// Import Angular packages
import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

// Import Models
import { User } from 'src/app/models/user';

// Import Services
import { UserService } from 'src/app/services/user/user-api.service';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent implements OnInit {
  @Input()
  user!: User;

  @Input()
  isLoggedIn!: boolean;

  hasLiked = false;

  constructor(private router: Router, private userService: UserService) {}

  ngAfterViewInit() {
    this.userService.hasLiked(this.user.username).subscribe((response) => {
      if (response) this.hasLiked = true;
    });
  }

  chatToUser() {
    let objToSend: NavigationExtras = {
      queryParams: {
        user: this.user,
      },
      skipLocationChange: false,
      fragment: 'top',
    };

    this.router.navigate(['/chat'], {
      state: { userToChat: objToSend },
    });
  }

  like() {
    if (this.isLoggedIn)
      this.userService.likeUser(this.user.username).subscribe(() => {
        this.hasLiked = true;
      });
    else this.router.navigate(['/login']);
  }

  unlike() {
    if (this.isLoggedIn)
      this.userService.unlikeUser(this.user.username).subscribe(() => {
        this.hasLiked = false;
      });
    else this.router.navigate(['/login']);
  }

  ngOnInit(): void {}
}
