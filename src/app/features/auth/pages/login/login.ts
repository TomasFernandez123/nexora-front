import { Component, inject, signal } from '@angular/core';
import { AuthLayoutCard } from '../../components/auth-layout-card/auth-layout-card';
import { AuthInput } from '../../components/auth-input/auth-input';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { emailOrUsernameValidator, passwordStrengthValidator } from '../../../../shared/forms-validators';
import { AuthButton } from "../../components/auth-button/auth-button";
import { AuthHeader } from '../../components/auth-header/auth-header';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Spinner } from '../../../../shared/components/spinner/spinner';
import { Toast } from '../../../../core/services/toast';
import { FormUtils } from '../../../../shared/utils/forms-utils';

@Component({
  selector: 'app-login',
  imports: [AuthLayoutCard, AuthInput, AuthButton, AuthHeader, ReactiveFormsModule, Spinner],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(Toast);
  formUtils = FormUtils;

  message = signal<string | null>(null);
  loading = signal<boolean>(false);

  userLoginForm: FormGroup = this.fb.group({
    emailOrUsername: ['', [Validators.required, emailOrUsernameValidator()]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
  });

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    this.loading.set(true);
    this.message.set(null);
    
    if (this.userLoginForm.invalid) return;

    const formValue = this.userLoginForm.value;
    const emailOrUsername = formValue.emailOrUsername;
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmail = emailRegex.test(emailOrUsername);
    
    const credentials = isEmail 
      ? { email: emailOrUsername, password: formValue.password }
      : { username: emailOrUsername, password: formValue.password };

    this.auth.login(credentials).subscribe({
      next: (res) => {
        this.auth.user.set(res.data.user);
        this.toastSvc.success('Login successful', 'Redirected to the posts!');
        this.auth.startSessionTimer();
        this.router.navigateByUrl('/main/posts');
      },
      error: (err) => {
        const errorMessage = err.error?.message || err.error?.error || 'Error logging in. Please try again.';
        this.toastSvc.error('Error logging in', errorMessage);
        this.message.set(errorMessage);
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    })
  }

  onGoogleLogin() {
    this.auth.redirectToGoogleAuth('login');
  }

}
