import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../core/components/sidebar/sidebar';
import { SearchLateralBar } from '../../shared/components/search-lateral-bar/search-lateral-bar';
import { Auth, User } from '../auth/services/auth';

@Component({
  selector: 'app-main',
  imports: [RouterOutlet, Sidebar, SearchLateralBar],
  templateUrl: './main.html',
})
export class Main implements OnInit {
  private readonly authService = inject(Auth);
  suggestedUsers = signal<User[]>([]);

  ngOnInit(): void {
    this.authService.getSuggestedUsers().subscribe({
      next: (response: any) => {
        const usersArray: User[] = Array.isArray(response)
          ? response
          : response.users || response.data || [];

        const currentUserId = this.authService.user()?._id;

        const otherUsers = usersArray.filter((u) => u._id !== currentUserId && u.isActive);

        const shuffled = otherUsers.sort(() => Math.random() - 0.5);
        this.suggestedUsers.set(shuffled.slice(0, 3));
      },
      error: (error) => {
        console.error('Error loading suggestions:', error);
      },
    });
  }

  removeUser(userId: string) {
    this.suggestedUsers.update((users) => users.filter((u) => u._id !== userId));
  }
}
