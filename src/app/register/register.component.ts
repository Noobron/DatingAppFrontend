// Import Angular packages
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { EventEmitter } from '@angular/core';

// Import Services
import { AccountApiService } from '../services/account/account-api.service';
import { Router } from '@angular/router';
import { NotificationService } from '../services/notifcation.service';

function calculateAge(birthDate: Date) {
  let currentDate = new Date();

  let years = currentDate.getFullYear() - birthDate.getFullYear();

  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() == birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    years--;
  }

  return years;
}

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

  minLengthValidator(length: number) {
    return (control: AbstractControl) => {
      const result = control.value.trim().length;
      return result >= length ? null : { requiredLength: length };
    };
  }

  getErrorMessage(control: AbstractControl) {
    if (control.dirty && control.errors) {
      if (control.errors.required) return 'This field is required';

      if (control.errors.requiredLength)
        return (
          'Minimum length of this should be : ' + control.errors.requiredLength
        );

      if (control.errors.invalidAge) return 'Minimum age should be 18';

      if (control.errors.invalidData) return 'Please enter valid data';
    }
    return '';
  }

  genderValidator(control: AbstractControl) {
    for (let gender of ['male', 'female'])
      if (gender === control.value.trim().toLowerCase()) return null;

    return { invalidData: true };
  }

  constructor(
    private accountApiService: AccountApiService,
    private elementRef: ElementRef,
    private router: Router,
    private notify: NotificationService
  ) {
    this.model = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        this.minLengthValidator(3),
      ]),
      password: new FormControl('', [
        Validators.required,
        this.minLengthValidator(3),
      ]),
      firstName: new FormControl('', [
        Validators.required,
        this.minLengthValidator(3),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        this.minLengthValidator(3),
      ]),
      gender: new FormControl('', [
        Validators.required,
        this.minLengthValidator(1),
        this.genderValidator,
      ]),
      dateOfBirth: new FormControl('', [
        Validators.required,
        (c: AbstractControl) =>
          calculateAge(new Date(c.value)) < 18 ? { invalidAge: true } : null,
      ]),
    });
  }

  // Sends a HTTP POST request to backend to register a new User
  register() {
    this.model.controls['gender'].setValue(
      this.model.controls['gender'].value.trim().toLowerCase()
    );

    console.log(this.model.value);
    this.accountApiService.register(this.model.value).subscribe(
      (res$) => {
        res$.subscribe(() => {
          this.router.navigate(['/find-matches']);
        });
      },
      (error) => {
        this.notify.notifyError(
          'Error in registration',
          'Please enter all the fields properly'
        );
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
