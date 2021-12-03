// Import Angular packages
import { Component, Input, OnInit } from '@angular/core';

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

  constructor() {}

  ngOnInit(): void {}
}
