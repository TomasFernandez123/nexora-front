import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function ageRangeValidator(minAge: number, maxAge: number): ValidatorFn {
  return (control: AbstractControl) => {
    const value = control.value;
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return { invalidDate: true };

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }

    if (age < minAge || age > maxAge) {
      return { ageRange: { requiredMin: minAge, requiredMax: maxAge, actual: age } };
    }

    return null;
  };
}

export function emailOrUsernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; 
    }

    const value = control.value.trim();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = emailRegex.test(value);
    
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const isValidUsername = usernameRegex.test(value);
    
    if (isValidEmail || isValidUsername) {
      return null; 
    }
    
    return { emailOrUsername: true }; 
  };
}

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // No validar si está vacío (usar Validators.required por separado)
    }

    const value = control.value;

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumeric = /[0-9]/.test(value);
    const isValidLength = value.length >= 8;

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && isValidLength;

    return !passwordValid ? { passwordStrength: true } : null;
  }
}

export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const value = control.value;

    // No permitir espacios
    if (/\s/.test(value)) {
      return { usernameSpaces: true };
    }

    // Validar formato: 3-20 caracteres, solo letras, números, guiones y guiones bajos
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(value)) {
      return { usernameFormat: true };
    }

    return null;
  };
}

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (confirmPassword.errors && !confirmPassword.errors['passwordMismatch']) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  };
}
