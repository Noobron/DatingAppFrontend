import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../_models/user';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  model: FormGroup;

  constructor(public accountService: AccountService) {
    this.model = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    this.accountService
      .login(this.model.value)
      .subscribe(() => {}, console.error);
  }

  ngOnInit(): void {}

  logout() {
    this.accountService.logout();
  }
}
