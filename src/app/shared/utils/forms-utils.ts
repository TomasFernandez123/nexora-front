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
        case 'invalidDate':
          return 'Invalid date';
        case 'invalidUsername':
          return 'Username must be 3-20 characters long and can include letters, numbers, underscores, and hyphens';
        case 'usernameSpaces':
          return 'Username cannot contain spaces';
        case 'usernameFormat':
          return 'Username must be 3-20 characters (letters, numbers, _ or -)';
        case 'ageRange':
          const info = errors['ageRange'];
          if (info && typeof info === 'object') {
            return `You must be between ${info.requiredMin} and ${info.requiredMax} years old` + (typeof info.actual === 'number' ? ` (you are ${info.actual})` : '');
          }
          return `Age must be within allowed range`;
      }
    }
    return '';
  }

  // Devuelve { minDate, maxDate } en formato YYYY-MM-DD para usar en atributos min/max de un input date
  static getDateInputBounds(minAge: number, maxAge: number) {
    const today = new Date();

    const max = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    const min = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());

    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    return { minDate: fmt(min), maxDate: fmt(max) };
  }
}

// ...existing code...