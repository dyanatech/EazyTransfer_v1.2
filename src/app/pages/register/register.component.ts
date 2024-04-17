import { CommonModule, NgIf } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';

export interface Register {
  tag: string;
  first_name: string;
  last_name: string;
  login: Login;
}

export interface Account {
  
}

export interface Login {
  agree_to_terms: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm!: FormGroup;

  subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _authService: AuthService
  ) {}
  ngOnInit() {
    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        cashTag: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        agreeTerms: [false, Validators.requiredTrue],
      },
      {
        validator: this.mustMatch('password', 'confirmPassword'),
      }
    );
  }

  // Custom validator to check if password and confirmPassword match
  mustMatch(password: string, confirmPassword: string) {
    return (formGroup: FormGroup) => {
      const passwordControl = formGroup.controls[password];
      const confirmPasswordControl = formGroup.controls[confirmPassword];

      if (
        confirmPasswordControl.errors &&
        !confirmPasswordControl.errors['mustMatch']
      ) {
        // return if another validator has already found an error on the confirmPassword
        return;
      }
      // set error on confirmPasswordControl if validation fails
      if (passwordControl.value !== confirmPasswordControl.value) {
        confirmPasswordControl.setErrors({ mustMatch: true });
      } else {
        confirmPasswordControl.setErrors(null);
      }
    };
  }

  onSubmit() {
    this._authService.show();
    if (this.registerForm.valid) {
      const registerObj: Register = {
        first_name: this.registerForm.controls['firstName']?.value,
        last_name: this.registerForm.controls['lastName']?.value,
        tag: this.registerForm.controls['cashTag']?.value,
        login: {
          email: this.registerForm.controls['email']?.value,
          password: this.registerForm.controls['password']?.value,
          agree_to_terms: this.registerForm.controls['agreeTerms']?.value,
        },
      };
      console.log('Form Value:', this.registerForm.value);
      // Implement your login logic here
      this.subscriptions.push(
        this._authService.register(registerObj).subscribe((res) => {
          if (res) {
            this.router.navigate(['home']);
          }
          this._authService.hide();
        })
      );
    }
    this._authService.hide();
  }
  gotologin() {
    this.router.navigate(['login']);
  }
}
