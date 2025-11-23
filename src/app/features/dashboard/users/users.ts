import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { Auth, User } from '../../auth/services/auth';
import { Spinner } from "../../../shared/components/spinner/spinner";
import { DatePipe } from '@angular/common';
import { Toast } from '../../../core/services/toast';
import { NewUserData, NewUserModal } from './components/new-user-modal/new-user-modal';

@Component({
  selector: 'app-users',
  imports: [Spinner, DatePipe, NewUserModal],
  templateUrl: './users.html',
  styleUrl: './users.scss'
})
export class Users implements OnInit {
  private readonly authService = inject(Auth);
  private readonly toastSvc = inject(Toast);

  users = signal<User[]>([]);
  loading = signal<boolean>(false);
  myUser = this.authService.user;

  @ViewChild('newUserModal') newUserModal!: NewUserModal;

  ngOnInit(): void {
    this.loading.set(true);
    this.authService.getAllUsers().subscribe({
      next: (response: any) => {
        const usersArray = Array.isArray(response) 
          ? response 
          : (response.users || response.data || []);
        this.users.set(usersArray);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading users:', err);
        this.users.set([]);
        this.loading.set(false);
      }
    });
  }

  deleteUser(userId: string) {
    this.authService.deleteUser(userId).subscribe({
      next: (response) => {
        const updatedUsers = this.users().map(user => {
          if (user._id === userId) {
            return { ...user, isActive: response.data.isActive};
          }
          return user;
        });
        this.users.set(updatedUsers);

        if (this.users().find(user => user._id === userId)?.isActive) {
          this.toastSvc.success('User Enabled', 'The user has been successfully enabled.');
        } else {
          this.toastSvc.success('User Disabled', 'The user has been successfully disabled.'); 
        }
      },

      error: (err) => {
        console.error('Error deleting user:', err);
      }
    })
  }

  openNewUserModal() {
    this.newUserModal.show();
  }

  createUser(userData: NewUserData) {
    this.loading.set(true);
    console.log('Creating user with data:', userData);
    
    this.authService.register(userData).subscribe({
      next: (res) => {
        const createdUser = res.data?.user;

        if (createdUser) {
          const updatedUsers = [createdUser, ...this.users()];
          this.users.set(updatedUsers);
          this.toastSvc.success('User Created', 'The new user has been created successfully.');
        }
      },

      error: (err) => {
        const errorMessage = err.error?.message || 'Error creating user. Please try again.';
        this.toastSvc.error('Error', errorMessage);
        this.loading.set(false);
        this.newUserModal.hide();
      },

      complete: () => {
        this.loading.set(false);
        this.newUserModal.hide();
      }
    })
  }

}
