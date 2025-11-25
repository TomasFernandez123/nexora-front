import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { PasswordToggleDirective } from '../../../../shared/directives/password-toggle.directive';

@Component({
  selector: 'app-auth-input',
  imports: [ReactiveFormsModule, PasswordToggleDirective],
  templateUrl: './auth-input.html',
})
export class AuthInput {
  label = input.required<string>();
  type = input<string>('text');
  placeHolder = input<string>('');
  control = input.required<any>();
  errorMessage = input<string>('Campo inválido');

  
}
