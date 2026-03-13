import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth, User } from '../../auth/services/auth';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-follow-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './follow.page.html',
})
export class FollowPage implements OnInit {
  private readonly auth = inject(Auth);
  private readonly toast = inject(Toast);

  allUsers = signal<User[]>([]);
  isLoading = signal(true);
  followingInProgress = signal<string[]>([]);

  suggestedUsers = computed(() => {
    const currentUserId = this.auth.user()?._id;
    return this.allUsers().filter((u) => u._id !== currentUserId && u.isActive);
  });

  ngOnInit(): void {
    this.auth.getSuggestedUsers().subscribe({
      next: (response: any) => {
        const usersArray: User[] = Array.isArray(response)
          ? response
          : response.users || response.data || [];
        this.allUsers.set(usersArray);
        this.isLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'Could not load suggested users.');
        this.isLoading.set(false);
      },
    });
  }

  isFollowing(userId: string): boolean {
    return this.auth.user()?.following?.includes(userId) ?? false;
  }

  isLoadingFollow(userId: string): boolean {
    return this.followingInProgress().includes(userId);
  }

  follow(user: User): void {
    if (this.isFollowing(user._id) || this.isLoadingFollow(user._id)) return;

    this.followingInProgress.update((ids) => [...ids, user._id]);

    this.auth.follow(user._id).subscribe({
      next: () => {
        const current = this.auth.user();
        if (current && !current.following.includes(user._id)) {
          this.auth.user.set({ ...current, following: [...current.following, user._id] });
        }
        this.toast.success('Followed!', `You are now following @${user.username}`);
      },
      error: () => {
        this.toast.error('Error', 'Could not follow user. Try again.');
      },
      complete: () => {
        this.followingInProgress.update((ids) => ids.filter((id) => id !== user._id));
      },
    });
  }
}
