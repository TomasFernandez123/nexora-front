import { Component, inject, signal } from '@angular/core';
import { RouterLinkActive, RouterLink, Router } from "@angular/router";
import { Auth } from '../../../features/auth/services/auth';
import { ThemeService } from '../../../shared/services/theme.service';
import { Toast } from '../../services/toast';

type MenuView = 'main' | 'appearance' | null;

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class Sidebar {
  private readonly auth = inject(Auth);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  private readonly toastSvc = inject(Toast);

  currentView = signal<MenuView>(null);

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

  logout() {
    this.auth.logout().subscribe({
      next: (response) => {
        this.auth.user.set(null);
        this.toastSvc.success(response.message, 'Redirected to login page');
        this.router.navigateByUrl('/login');
      }
    });
  }
}
