import { Component, inject, signal } from '@angular/core';
import { Auth, User } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";
import { DatePipe } from '@angular/common';
import { EditProfileModal, EditProfileData } from './components/edit-profile-modal/edit-profile-modal';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-account',
  imports: [Post, DatePipe, EditProfileModal],
  templateUrl: './account.html',
})
export class Account {
  private readonly auth = inject(Auth);
  private readonly toastSvc = inject(Toast);

  profile = this.auth.user;
  showEditModal = signal(false);

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
}
