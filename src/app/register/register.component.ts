import { Component, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  @Output() cancelRegister = new EventEmitter<boolean>();
  model: FormGroup;

  constructor(private accountService: AccountService) {
    this.model = new FormGroup({
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
      ]),
      password: new FormControl('', [Validators.required]),
    });
  }

  register() {
    this.accountService.register(this.model.value).subscribe((response) => {
      console.log(response);
      this.cancel();
    }, console.error);
  }

  cancel() {
    this.cancelRegister.emit(false);
  }

  ngOnInit(): void {}
}
