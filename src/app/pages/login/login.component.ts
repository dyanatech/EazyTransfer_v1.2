import { NgIf } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  loginForm!: FormGroup; // Declare the form

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authService: AuthService
  ) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this._authService.show();
    if (this.loginForm.valid) {
      console.log('Form Value:', this.loginForm.value);
      // Implement your login logic here
      this.subscriptions.push(
        this._authService
          .login(
            this.loginForm.controls['email'].value,
            this.loginForm.controls['password'].value
          )
          .subscribe((res) => {
            if(res) {
              this.router.navigate(['home']);
            }
            this._authService.hide();
          })
      );
    }
    this._authService.hide();
  }
  get f() {
    return this.loginForm.controls;
  }

  gotoRegister() {
    this.router.navigate(['register']);
  }
}
