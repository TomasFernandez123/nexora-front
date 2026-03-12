import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Auth, User } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";
import { DatePipe } from '@angular/common';
import { EditProfileModal, EditProfileData } from './components/edit-profile-modal/edit-profile-modal';
import { Toast } from '../../../core/services/toast';
import { Posts } from '../../../core/services/posts';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { passwordStrengthValidator } from '../../../shared/forms-validators';

@Component({
  selector: 'app-account',
  imports: [Post, DatePipe, EditProfileModal, Spinner, ReactiveFormsModule],
  templateUrl: './account.html',
})
export class Account implements OnInit {
  private readonly auth = inject(Auth);
  private readonly toastSvc = inject(Toast);
  private readonly postSvc = inject(Posts);
  private readonly fb = inject(FormBuilder);

  profile = this.auth.user;
  myPosts = this.postSvc.myPosts;
  loading = this.postSvc.loading;

  showEditModal = signal(false);
  showSetPasswordForm = signal(false);
  setPasswordLoading = signal(false);
  setPasswordConfigured = signal<boolean | null>(null);

  readonly setPasswordForm = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
    confirmPassword: ['', [Validators.required]],
  });

  canShowSetPasswordCta = computed(() => {
    const user = this.profile();
    if (!user) return false;

    if (this.setPasswordConfigured() === true) return false;

    if (user.hasPassword === true) return false;

    if (user.hasPassword === false) return true;

    return sessionStorage.getItem('oauth-login') === '1';
  });

  passwordsMismatch = computed(() => {
    const password = this.setPasswordForm.get('password')?.value ?? '';
    const confirmPassword = this.setPasswordForm.get('confirmPassword')?.value ?? '';

    if (!password || !confirmPassword) return false;

    return password !== confirmPassword;
  });

  ngOnInit() {
    const userId = this.profile()?._id;
    if (userId) {
      this.postSvc.getMyPosts(userId);

      const localConfigured = localStorage.getItem(this.getPasswordConfiguredKey(userId)) === '1';
      if (localConfigured) {
        this.setPasswordConfigured.set(true);
      }
    }

    const hasPassword = this.profile()?.hasPassword;
    if (typeof hasPassword === 'boolean') {
      this.setPasswordConfigured.set(hasPassword);

      if (hasPassword && userId) {
        localStorage.setItem(this.getPasswordConfiguredKey(userId), '1');
      }
    }
  }

  onEditProfile() {
    this.showEditModal.set(true);
  }

  onCloseModal() {
    this.showEditModal.set(false);
  }

  onSaveProfile(changedData: EditProfileData) {
    const userId = this.profile()?._id;
    if (!userId) return;

    if (Object.keys(changedData).length === 0) {
      this.toastSvc.error('No changes', 'No fields were modified');
      this.showEditModal.set(false);
      return;
    }

    this.auth.modifyUser(userId, changedData).subscribe({
      next: (response) => {
        this.toastSvc.success('Profile updated', 'Your profile has been updated successfully');
        if (response.data) {
          this.auth.user.set(response.data);
        }
        this.showEditModal.set(false);
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Failed to update profile';
        this.toastSvc.error('Update failed', errorMessage);
        this.showEditModal.set(false);
      }
    });
  }

  onToggleSetPasswordForm() {
    this.showSetPasswordForm.update((visible) => !visible);
  }

  onSetPassword() {
    if (this.setPasswordForm.invalid || this.passwordsMismatch()) {
      this.setPasswordForm.markAllAsTouched();
      this.toastSvc.error('Invalid password', 'Please review the password requirements.');
      return;
    }

    const password = this.setPasswordForm.get('password')?.value;
    if (!password) return;

    this.setPasswordLoading.set(true);

    this.auth.setPassword({ password }).subscribe({
      next: (response) => {
        const userId = this.profile()?._id;
        this.setPasswordConfigured.set(true);
        this.showSetPasswordForm.set(false);
        this.setPasswordForm.reset();
        sessionStorage.removeItem('oauth-login');
        if (userId) {
          localStorage.setItem(this.getPasswordConfiguredKey(userId), '1');
        }
        this.toastSvc.success('Password configured', response.message || 'Your password is now set.');
      },
      error: (err) => {
        const userId = this.profile()?._id;
        const errorMessage =
          err.error?.message || err.error?.error || 'Could not configure password. Try again.';

        if (errorMessage.toLowerCase().includes('already configured')) {
          this.setPasswordConfigured.set(true);
          sessionStorage.removeItem('oauth-login');
          if (userId) {
            localStorage.setItem(this.getPasswordConfiguredKey(userId), '1');
          }
        }

        this.toastSvc.error('Set password failed', errorMessage);
      },
      complete: () => {
        this.setPasswordLoading.set(false);
      },
    });
  }

  private getPasswordConfiguredKey(userId: string) {
    return `password-configured-${userId}`;
  }
}
