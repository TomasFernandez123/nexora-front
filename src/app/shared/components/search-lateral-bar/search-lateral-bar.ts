import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  afterNextRender,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SuggestionToFollow } from '../suggestion-to-follow/suggestion-to-follow';
import { Auth, User } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-search-lateral-bar',
  imports: [SuggestionToFollow],
  templateUrl: './search-lateral-bar.html',
})
export class SearchLateralBar {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  users = input.required<User[]>();
  userRemoved = output<string>();

  searchQuery = signal('');
  isSearchOpen = signal(false);
  searchLoading = signal(false);
  searchUsers = signal<User[]>([]);
  searchError = signal<string | null>(null);
  private hasLoadedSearchUsers = signal(false);

  sidebarContainer = viewChild<ElementRef<HTMLElement>>('sidebarContainer');
  searchContainer = viewChild<ElementRef<HTMLElement>>('searchContainer');
  stickyTop = signal(0);

  filteredSearchUsers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    if (!query) return [];

    return this.searchUsers()
      .filter((user) => {
      return (
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
      );
      })
      .slice(0, 8);
  });

  constructor() {
    afterNextRender(() => {
      this.calculateStickyTop();
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScrollOrResize() {
    this.calculateStickyTop();
  }

  private calculateStickyTop() {
    const el = this.sidebarContainer()?.nativeElement;
    if (!el) return;

    const vh = window.innerHeight;
    const height = el.offsetHeight;

    if (height <= vh) {
      this.stickyTop.set(0);
    } else {
      // Sticks softly to the bottom, leaving a 16px bottom padding
      this.stickyTop.set(vh - height - 16);
    }
  }

  onFollowed(userId: string) {
    this.userRemoved.emit(userId);
  }

  updateSearchQuery(value: string) {
    this.searchQuery.set(value);
    this.isSearchOpen.set(true);
    this.ensureSearchUsersLoaded();
  }

  onSearchFocus() {
    this.isSearchOpen.set(true);
    this.ensureSearchUsersLoaded();
  }

  onSearchEscape() {
    this.isSearchOpen.set(false);
  }

  openUserProfile(userId: string) {
    this.isSearchOpen.set(false);
    this.router.navigate(['/main/profile', userId]);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const container = this.searchContainer()?.nativeElement;
    const target = event.target as Node | null;

    if (container && target && !container.contains(target)) {
      this.isSearchOpen.set(false);
    }
  }

  private ensureSearchUsersLoaded() {
    if (this.hasLoadedSearchUsers() || this.searchLoading()) return;

    this.searchLoading.set(true);
    this.searchError.set(null);

    this.auth.getAllUsers().subscribe({
      next: (users) => {
        this.setSearchUsers(users);
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.loadSearchUsersFromSuggestions();
          return;
        }

        this.searchError.set('Could not load users. Try again.');
        this.searchLoading.set(false);
      },
      complete: () => {
        if (this.hasLoadedSearchUsers()) {
          this.searchLoading.set(false);
        }
      },
    });
  }

  private loadSearchUsersFromSuggestions() {
    this.auth.getSuggestedUsers().subscribe({
      next: (response: User[] | { users?: User[]; data?: User[] }) => {
        const users = Array.isArray(response) ? response : response.users || response.data || [];
        this.setSearchUsers(users);
      },
      error: () => {
        this.searchError.set('Could not load users. Try again.');
        this.searchLoading.set(false);
      },
      complete: () => {
        this.searchLoading.set(false);
      },
    });
  }

  private setSearchUsers(users: User[]) {
    const currentUserId = this.auth.user()?._id;
    const activeUsers = users.filter((user) => user.isActive && user._id !== currentUserId);
    this.searchUsers.set(activeUsers);
    this.hasLoadedSearchUsers.set(true);
  }

  trends = [
    { tag: '#javascript', posts: '120K' },
    { tag: '#webdev', posts: '85K' },
    { tag: '#hiring', posts: '42K' },
  ];

  events = [
    { title: 'React Workshop', date: 'Tomorrow, 18:00', type: 'Webinar' },
    { title: 'Tech Meetup BsAs', date: 'This Friday', type: 'Meetup' },
    { title: 'Next.js 15 Release', date: 'Oct 26', type: 'Launch' },
  ];

  groups = [
    { name: 'React Developers', members: '15K' },
    { name: 'Ciberseguridad', members: '8.2K' },
    { name: 'Frontend Masters', members: '24K' },
  ];
}
