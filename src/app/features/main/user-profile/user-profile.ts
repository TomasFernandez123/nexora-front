import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Auth, User } from '../../auth/services/auth';
import { Posts } from '../../../core/services/posts';
import { Post } from '../../../shared/components/post/post';
import { DatePipe } from '@angular/common';
import { Spinner } from '../../../shared/components/spinner/spinner';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-user-profile',
  imports: [Post, DatePipe, Spinner],
  templateUrl: './user-profile.html',
})
export class UserProfile implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(Auth);
  private readonly postSvc = inject(Posts);
  private readonly toast = inject(Toast);
  private readonly destroyRef = inject(DestroyRef);

  profile = signal<User | null>(null);
  userPosts = signal<any[]>([]);
  loading = signal(true);
  followLoading = signal(false);

  isFollowing = computed(() => {
    const currentUser = this.auth.user();
    const profileUser = this.profile();
    if (!currentUser || !profileUser) return false;
    return currentUser.following?.includes(profileUser._id) ?? false;
  });

  isOwnProfile = computed(() => {
    const currentUser = this.auth.user();
    const profileUser = this.profile();
    if (!currentUser || !profileUser) return false;
    return currentUser._id === profileUser._id;
  });

  ngOnInit() {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const userId = params.get('id');
      if (!userId) {
        this.router.navigate(['/main/posts']);
        return;
      }

      const currentUser = this.auth.user();
      if (currentUser && currentUser._id === userId) {
        this.router.navigate(['/main/account']);
        return;
      }

      this.loadProfile(userId);
    });
  }

  private loadProfile(userId: string) {
    this.loading.set(true);
    this.auth.getUserById(userId).subscribe({
      next: (user) => {
        this.profile.set(user.data);
        this.loadUserPosts(userId);
      },
      error: () => {
        this.toast.error('Error', 'Could not load user profile');
        this.loading.set(false);
      },
    });
  }

  private loadUserPosts(userId: string) {
    this.postSvc.getMyPosts(userId);
    this.userPosts = this.postSvc.myPosts;
    this.loading.set(false);
  }

  toggleFollow() {
    const profileUser = this.profile();
    if (!profileUser || this.followLoading()) return;

    this.followLoading.set(true);
    const action$ = this.isFollowing()
      ? this.auth.unfollow(profileUser._id)
      : this.auth.follow(profileUser._id);

    action$.subscribe({
      next: () => {
        const currentUser = this.auth.user();
        if (currentUser) {
          const updatedFollowing = this.isFollowing()
            ? currentUser.following.filter((id) => id !== profileUser._id)
            : [...currentUser.following, profileUser._id];

          this.auth.user.set({ ...currentUser, following: updatedFollowing });

          const updatedFollowers = this.isFollowing()
            ? [...(profileUser.followers || []), currentUser._id]
            : (profileUser.followers || []).filter((id) => id !== currentUser._id);

          this.profile.set({ ...profileUser, followers: updatedFollowers });
        }

        const msg = this.isFollowing()
          ? `You are now following @${profileUser.username}`
          : `You unfollowed @${profileUser.username}`;
        this.toast.success('Done', msg);
        this.followLoading.set(false);
      },
      error: () => {
        this.toast.error('Error', 'Could not complete the action. Try again.');
        this.followLoading.set(false);
      },
    });
  }
}
