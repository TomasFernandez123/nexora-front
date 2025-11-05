import { Component, inject } from '@angular/core';
import { Auth } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-account',
  imports: [Post, DatePipe],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);

  profile = this.auth.user;
}
