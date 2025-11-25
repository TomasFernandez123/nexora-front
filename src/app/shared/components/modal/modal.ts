import { Component, input, output } from '@angular/core';
import { ScrollLockDirective } from '../../directives/scroll-lock.directive';

@Component({
  selector: 'app-modal',
  imports: [ScrollLockDirective],
  templateUrl: './modal.html',
  styleUrl: './modal.scss'
})
export class Modal {
  title = input<string>('');
  
  close = output();

  onClose() {
    this.close.emit();
  }

  onOverlayClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
