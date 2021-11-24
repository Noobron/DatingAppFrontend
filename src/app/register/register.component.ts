// Import Angular packages
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';

// Import Services
import { AccountService } from '../_services/account.service';
import { Router } from '@angular/router';
import { NotificationService } from '../_services/notifcation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  // Attribute to emit in case of cancel action
  @Output() cancelRegister = new EventEmitter<boolean>();

  // Reactive form for registering a new User
  model: FormGroup;

  initialColor: string = '';

  constructor(
    private accountService: AccountService,
    private elementRef: ElementRef,
    private router: Router,
    private notify: NotificationService
  ) {
    this.model = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl('', [Validators.required]),
      first_name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      last_name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
    });
  }

  // Sends a HTTP POST request to backend to register a new User
  register() {
    this.accountService.register(this.model.value).subscribe(
      (res$) => {
        res$.subscribe((response) => {
          console.log(response);
          this.router.navigate(['/members']);
        });
      },
      (error) => {
        if (error.error.detail)
          this.notify.notifyError('Error in registration', error.error.detail);
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
