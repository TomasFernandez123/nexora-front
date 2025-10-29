import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-button-toggle-mode',
  imports: [],
  templateUrl: './button-toggle-mode.html'
})
export class ButtonToggleMode {
  themeService = inject(ThemeService);

  toggleDarkMode() {
    this.themeService.toggleTheme();
  }
}
