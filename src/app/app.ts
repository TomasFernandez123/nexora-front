import { Component, signal, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './shared/services/theme.service';
import { Auth } from './features/auth/services/auth';
import { ToastComponent } from "./shared/components/toast/toast";

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

  ngOnInit() {
    this.auth.loadUser();
    this.themeService.loadTheme();
  }
}
