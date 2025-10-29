import { Component, input } from '@angular/core';

@Component({
  selector: 'app-auth-button',
  imports: [],
  templateUrl: './auth-button.html',
})
export class AuthButton {
  title = input.required<string>();
  disabled = input<boolean>(false);
}
