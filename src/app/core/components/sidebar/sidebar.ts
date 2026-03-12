import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { RouterLinkActive, RouterLink, Router } from "@angular/router";
import { Auth, User } from '../../../features/auth/services/auth';
import { ThemeService } from '../../../shared/services/theme.service';
import { Toast } from '../../services/toast';
import { CommonModule } from '@angular/common';

type MenuView = 'main' | 'appearance' | null;

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, RouterLink, CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  private readonly auth = inject(Auth);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(Toast);

  currentView = signal<MenuView>(null);
  isMobileMenuOpen = signal(false);
  showMobileTopBar = signal(true);
  showMobileSearch = signal(false);
  mobileSearchLoading = signal(false);
  mobileSearchQuery = signal('');
  mobileSuggestedUsers = signal<User[]>([]);
  mobileFollowLoadingIds = signal<string[]>([]);
  private lastScrollY = 0;

  role = this.auth.user()?.role;
  currentUser = this.auth.user;

  isDashboardOpen = signal(false);

  filteredMobileUsers = computed(() => {
    const query = this.mobileSearchQuery().trim().toLowerCase();
    const users = this.mobileSuggestedUsers();

    if (!query) return users;

    return users.filter((user) => {
      return (
        user.username.toLowerCase().includes(query) ||
        user.name.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
      );
    });
  });

  isPostDetailRoute(): boolean {
    return this.router.url.includes('/posts/');
  }

  isHomeFeedRoute(): boolean {
    return this.router.url === '/main/posts' || this.router.url.startsWith('/main/posts?');
  }

  isFollowingFeedActive(): boolean {
    return this.router.url.includes('feed=following');
  }

  openForYouFeed() {
    this.closeMobileSearch();
    this.router.navigate(['/main/posts'], {
      queryParams: { feed: null },
      queryParamsHandling: 'merge',
    });
  }

  openFollowingFeed() {
    this.closeMobileSearch();
    this.router.navigate(['/main/posts'], {
      queryParams: { feed: 'following' },
      queryParamsHandling: 'merge',
    });
  }

  openQuickPost() {
    this.closeMobileMenu();
    this.closeMobileSearch();

    sessionStorage.setItem('open-create-post', '1');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nexora-open-create-post'));
    }

    if (!this.router.url.startsWith('/main/posts')) {
      this.router.navigate(['/main/posts']);
    }
  }

  toggleMobileMenu() {
    this.showMobileSearch.set(false);
    this.isMobileMenuOpen.update(view => !view);
    this.showMobileTopBar.set(true);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
    this.closeDashboard();
    this.closeMenu();
  }

  toggleMobileSearch() {
    const next = !this.showMobileSearch();
    this.showMobileSearch.set(next);
    this.isMobileMenuOpen.set(false);
    this.showMobileTopBar.set(true);

    if (next) {
      this.loadMobileSuggestedUsers();
    }
  }

  closeMobileSearch() {
    this.showMobileSearch.set(false);
  }

  updateMobileSearchQuery(value: string) {
    this.mobileSearchQuery.set(value);
  }

  openUserProfile(userId: string) {
    this.closeMobileMenu();
    this.closeMobileSearch();
    this.router.navigate(['/main/profile', userId]);
  }

  isFollowingUser(userId: string): boolean {
    return this.auth.user()?.following?.includes(userId) ?? false;
  }

  followFromMobileSearch(user: User) {
    if (this.mobileFollowLoadingIds().includes(user._id) || this.isFollowingUser(user._id)) return;

    this.mobileFollowLoadingIds.update((ids) => [...ids, user._id]);

    this.auth.follow(user._id).subscribe({
      next: () => {
        const current = this.auth.user();
        if (current && !current.following.includes(user._id)) {
          this.auth.user.set({ ...current, following: [...current.following, user._id] });
        }

        this.toastSvc.success('Followed', `You are now following @${user.username}`);
      },
      error: () => {
        this.toastSvc.error('Error', 'Could not follow user.');
      },
      complete: () => {
        this.mobileFollowLoadingIds.update((ids) => ids.filter((id) => id !== user._id));
      },
    });
  }

  toggleDashboard() {
    this.isDashboardOpen.update(open => !open);
  }

  closeDashboard() {
    this.isDashboardOpen.set(false);
  }

  isDashboardActive(): boolean {
    return this.router.url.startsWith('/dashboard');
  }

  toggleMenu() {
    if (this.currentView() === null) {
      this.currentView.set('main');
    } else {
      this.currentView.set(null);
    }
  }

  openAppearance() {
    this.currentView.set('appearance');
  }

  backToMain() {
    this.currentView.set('main');
  }

  closeMenu() {
    this.currentView.set(null);
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    if (typeof window === 'undefined' || window.innerWidth >= 1024) return;

    const currentScrollY = window.scrollY || 0;
    const isAtTop = currentScrollY <= 8;
    const isScrollingUp = currentScrollY < this.lastScrollY - 2;
    const isScrollingDown = currentScrollY > this.lastScrollY + 2;

    if (isAtTop || isScrollingUp) {
      this.showMobileTopBar.set(true);
    } else if (isScrollingDown && !this.isMobileMenuOpen() && !this.showMobileSearch()) {
      this.showMobileTopBar.set(false);
    }

    this.lastScrollY = currentScrollY;
  }

  logout() {
    this.auth.logout().subscribe({
      next: (response) => {
        this.auth.user.set(null);
        this.toastSvc.success(response.message, 'Redirected to login page');
        this.router.navigateByUrl('/login');
        this.closeMobileMenu();
      }
    });
  }

  private loadMobileSuggestedUsers() {
    if (this.mobileSuggestedUsers().length > 0) return;

    this.mobileSearchLoading.set(true);

    this.auth.getSuggestedUsers().subscribe({
      next: (response: any) => {
        const usersArray: User[] = Array.isArray(response)
          ? response
          : response.users || response.data || [];

        this.mobileSuggestedUsers.set(usersArray.filter((user) => user.isActive));
      },
      error: () => {
        this.toastSvc.error('Error', 'Could not load suggestions.');
      },
      complete: () => {
        this.mobileSearchLoading.set(false);
      },
    });
  }
}
