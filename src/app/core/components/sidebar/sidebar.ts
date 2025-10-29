import { Component, inject, signal } from '@angular/core';
import { RouterLinkActive, RouterLink } from "@angular/router";
import { Auth } from '../../../features/auth/services/auth';
import { ThemeService } from '../../../shared/services/theme.service';

type MenuView = 'main' | 'appearance' | null;

@Component({
  selector: 'app-sidebar',
  imports: [RouterLinkActive, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./styles.scss']
})
export class Sidebar {
  private readonly auth = inject(Auth);
  readonly theme = inject(ThemeService);


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
    this.auth.logout();
  }
}
