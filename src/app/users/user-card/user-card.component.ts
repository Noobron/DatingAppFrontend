// Import Angular packages
import { Component, Input, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';

// Import Models
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-card',
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent implements OnInit {
  @Input()
  user!: User;

  constructor(private router: Router) {}

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

  ngOnInit(): void {}
}
