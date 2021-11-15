// Import Angular packages
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Import Services
import { AccountService } from '../_services/account.service';
import { NotificationService } from '../_services/notifcation.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit {
  // Reactive form for login
  model: FormGroup;

  constructor(
    public accountService: AccountService,
    private router: Router,
    private notify: NotificationService
  ) {
    this.model = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required]),
    });
  }

  onSubmit(): void {
    this.accountService.login(this.model.value).subscribe(
      () => {
        this.router.navigateByUrl('/members');
      },
      (error) => {
        this.notify.notifyError( 'Oops..!', error.error.detail);
        console.log(error);
      }
    );
  }

  ngOnInit(): void {}

  logout() {
    this.accountService.logout();
    this.router.navigateByUrl('/');
  }
}
