// Import Angular packages
import { Component, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';

// Import Services
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  // Attribute to emit in case of cancel action
  @Output() cancelRegister = new EventEmitter<boolean>();

  // Reactive form for registering a new User
  model: FormGroup;

  constructor(private accountService: AccountService) {
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
    this.accountService.register(this.model.value).subscribe((response) => {
      console.log(response);
      this.cancel();
    }, console.error);
  }

  // Emit cancel action
  cancel() {
    this.cancelRegister.emit(false);
  }

  ngOnInit(): void {}
}
