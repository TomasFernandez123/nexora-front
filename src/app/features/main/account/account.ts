import { Component, inject } from '@angular/core';
import { Auth } from '../../auth/services/auth';

@Component({
  selector: 'app-account',
  imports: [],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);

  profile = this.auth.user;
}
