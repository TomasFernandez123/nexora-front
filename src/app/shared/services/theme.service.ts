import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.loadTheme();
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode.set(savedTheme);
    this.applyTheme(savedTheme);
  }

  toggleTheme() {
    const newTheme = !this.isDarkMode();
    this.isDarkMode.set(newTheme);
    this.applyTheme(newTheme);
    localStorage.setItem('darkMode', newTheme.toString());
  }

  toggleDarkMode() {
    localStorage.setItem('darkMode', 'true');
    this.isDarkMode.set(true);
    this.applyTheme(true);
  }

  toggleLightMode() {
    localStorage.setItem('darkMode', 'false');
    this.isDarkMode.set(false);
    this.applyTheme(false);
  }

  private applyTheme(isDark: boolean) {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }
}
