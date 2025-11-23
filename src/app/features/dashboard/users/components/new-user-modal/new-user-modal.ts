import { Component, signal, computed, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { usernameValidator, ageRangeValidator, passwordStrengthValidator, passwordMatchValidator } from '../../../../../shared/forms-validators';
import { FormUtils } from '../../../../../shared/utils/forms-utils';
import { AuthInput } from "../../../../auth/components/auth-input/auth-input";

export interface NewUserData {
  name: string;
  lastName: string;
  email: string;
  userName: string;
  password: string;
  confirmPassword: string; // solo para el validador
  date: string;
  description: string;
  photo: File;
  role: 'user' | 'admin';
}

@Component({
  selector: 'app-new-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule, AuthInput],
  templateUrl: './new-user-modal.html',
  styleUrls: ['./new-user-modal.scss']
})
export class NewUserModal {
    private fb = inject(FormBuilder);
    formUtils = FormUtils;

    open = signal(false);
    isSubmitting = signal(false);

    @Output() submit = new EventEmitter<NewUserData>();
    @Output() cancel = new EventEmitter<void>();
  
    userForm: FormGroup = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email]],
        userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20), usernameValidator()]],
        password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
        confirmPassword: ['', [Validators.required]],
        date: ['', [Validators.required, ageRangeValidator(13, 100)]],
        description: ['', [Validators.required, Validators.maxLength(150)]],
        photo: ['', [Validators.required]],
        role: ['user', [Validators.required]],
    },  { validators: [passwordMatchValidator()] });

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.userForm.patchValue({ photo: file });
            this.userForm.get('photo')?.updateValueAndValidity();
        } else {
            this.userForm.patchValue({ photo: '' });
            this.userForm.get('photo')?.updateValueAndValidity();
        }
    }

    show() {
        this.open.set(true);
        this.userForm.reset({ role: 'user' });
        this.isSubmitting.set(false);
    }

    hide() {
        this.open.set(false);
        this.userForm.reset({ role: 'user' });
        this.cancel.emit();
    }

    onSubmit() {
        if (this.userForm.invalid || this.isSubmitting()) return;
        
        this.isSubmitting.set(true);
        this.submit.emit(this.userForm.value);
    }

    onCancel() {
        this.hide();
    }

    getErrorMessage(controlName: string): string {
        return FormUtils.getFieldError(this.userForm, controlName);
    }

    isFieldInvalid(controlName: string): boolean {
        const control = this.userForm.get(controlName);
        return !!(control && control.invalid && control.touched);
    }

    resetSubmitting() {
        this.isSubmitting.set(false);
    }
}
