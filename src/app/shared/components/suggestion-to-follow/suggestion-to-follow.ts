import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth, User } from '../../../features/auth/services/auth';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-suggestion-to-follow',
  imports: [RouterLink],
  templateUrl: './suggestion-to-follow.html',
})
export class SuggestionToFollow {
  private readonly auth = inject(Auth);
  private readonly toast = inject(Toast);

  user = input.required<User>();
  followed = output<string>();

  follow() {
    const u = this.user();
    this.auth.follow(u._id).subscribe({
      next: () => {
        this.toast.success('Followed!', `You are now following @${u.username}`);
        this.followed.emit(u._id);
      },
      error: () => {
        this.toast.error('Error', 'Could not follow user. Try again.');
      },
    });
  }
}
