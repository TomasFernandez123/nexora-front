import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class FormUtils {
  static isValidField(form: FormGroup, fieldName: string): boolean | null {
    return !!form.controls[fieldName] && form.controls[fieldName].touched;
  }

  static getFieldError(form: FormGroup, fieldName: string): string {
    if (!form.controls[fieldName]) return '';

    const errors = form.controls[fieldName].errors ?? {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        case 'minlength':
          return `Minimum ${errors['minlength'].requiredLength} characters required`;
        case 'maxlength':
          return `Maximum ${errors['maxlength'].requiredLength} characters allowed`;
        case 'email':
          return 'Please enter a valid email address';
        case 'min':
          return `Minimum value allowed is ${errors['min'].min}`;
        case 'max':
          return `Maximum value allowed is ${errors['max'].max}`;
        case 'passwordStrength':
          return 'Password must contain uppercase, lowercase letters, and a number';
        case 'passwordMismatch':
          return 'Passwords do not match';
        case 'emailOrUsername':
          return 'Please enter a valid email or username (3-20 characters)';
      }
    }
    return '';
  }
}

// ...existing code...