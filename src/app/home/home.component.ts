// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import Services
import { AccountManagerService } from '../services/account/account-manager.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  constructor(public accountManagerService: AccountManagerService) {}

  ngOnInit(): void {}
}
