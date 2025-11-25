import { Component, signal, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-session-warning-modal',
  standalone: true,
  imports: [],
  templateUrl: './session-warning-modal.html',
  styleUrl: './session-warning-modal.scss'
})
export class SessionWarningModal {
  open = signal(false);

  @Output() extend = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  show() {
    this.open.set(true);
  }

  hide() {
    this.open.set(false);
  }

  onExtend() {
    this.extend.emit();
    this.hide();
  }

  onCancel() {
    this.cancel.emit();
    this.hide();
  }
}
