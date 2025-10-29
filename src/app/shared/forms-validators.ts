import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function emailOrUsernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null; // No validar si está vacío (usar Validators.required por separado)
    }

    const value = control.value.trim();
    
    // Validar si es un email válido
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isValidEmail = emailRegex.test(value);
    
    // Validar si es un username válido (3-20 caracteres alfanuméricos, guiones bajos o guiones)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    const isValidUsername = usernameRegex.test(value);
    
    if (isValidEmail || isValidUsername) {
      return null; // Válido
    }
    
    return { emailOrUsername: true }; // Inválido
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
