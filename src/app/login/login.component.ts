// Import Angular packages
import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

// Import Services
import { AccountService } from '../_services/account.service';
import { NotificationService } from '../_services/notifcation.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Reactive form for login
  model: FormGroup;

  initialColor: string = '';

  constructor(
    public accountService: AccountService,
    private router: Router,
    private elementRef: ElementRef,
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
        this.router.navigate(['/members']);
      },
      (error) => {
        if (error.error.detail)
          this.notify.notifyError('Error in login', error.error.detail);
      }
    );
  }

  ngAfterViewInit() {
    this.initialColor =
      this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor;

    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      '#6200ff';
  }

  ngOnDestroy() {
    this.elementRef.nativeElement.ownerDocument.body.style.backgroundColor =
      this.initialColor;
  }

  ngOnInit(): void {}
}