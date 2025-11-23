import { Component, signal, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { Auth } from './features/auth/services/auth';
import { ToastComponent } from "./shared/components/toast/toast";
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('red-social');
  private themeService = inject(ThemeService);
  private auth = inject(Auth);
  private router = inject(Router);

  ngOnInit() {
    this.themeService.loadTheme();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        const url = this.router.url;

        const isPublic =
          url.startsWith('/login') ||
          url.startsWith('/register');

        if (!isPublic) {
          this.auth.loadUser();
        }
    });
  }
}
