import { Component, inject, signal } from '@angular/core';
import { AuthLayoutCard } from '../../components/auth-layout-card/auth-layout-card';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { passwordStrengthValidator, passwordMatchValidator, ageRangeValidator, usernameValidator } from '../../../../shared/forms-validators';
import { AuthInput } from '../../components/auth-input/auth-input';
import { AuthButton } from '../../components/auth-button/auth-button';
import { AuthHeader } from "../../components/auth-header/auth-header";
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Spinner } from "../../../../shared/components/spinner/spinner";
import { FormUtils } from '../../../../shared/utils/forms-utils';
import { Toast } from '../../../../core/services/toast';

@Component({
  selector: 'app-register',
  imports: [AuthLayoutCard, AuthInput, AuthButton, AuthHeader, ReactiveFormsModule, Spinner],
  templateUrl: './register.html',
})
export class Register {
  private fb = inject(FormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(Toast);
  formUtils = FormUtils;

  loading = signal(false);

  userRegisterForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), usernameValidator()]],
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
    date: ['', [Validators.required, ageRangeValidator(13, 100)]],
    description: ['', [Validators.required, Validators.maxLength(150)]],
    photo: ['', [Validators.required]],
  }, { validators: [passwordMatchValidator()] });

  message = signal<string | null>(null);

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.userRegisterForm.patchValue({ photo: file });
      this.userRegisterForm.get('photo')?.updateValueAndValidity();
    } else {
      this.userRegisterForm.patchValue({ photo: '' });
      this.userRegisterForm.get('photo')?.updateValueAndValidity();
    }
  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if(this.userRegisterForm.invalid) return;

    this.loading.set(true);

    const credentials = this.userRegisterForm.value;

    this.auth.register(credentials).subscribe({
      next: (res) => {
        this.toastSvc.success('Account created', 'Your account has been created successfully. Please log in.');
        this.router.navigateByUrl('/login');
      },

      error: (err) => {
        const errorMessage = err.error?.message || err.error?.error || 'Error al crear cuenta. Intenta nuevamente.';
        this.message.set(errorMessage)
        this.toastSvc.error('Error creating account', errorMessage);
        this.loading.set(false);
      },

      complete: () => {
        this.loading.set(false);
      }
    })
  }
}
