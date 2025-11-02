import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  message: string;
  description?: string;
  type: ToastType;
  duration?: number; 
}

@Injectable({
  providedIn: 'root'
})
export class Toast {
  private _toast = signal<ToastMessage | null>(null);
  readonly toast = this._toast.asReadonly();

  show(message: string, description?: string, type: ToastType = 'info', duration = 3000) {
    const toast: ToastMessage = { message, description, type, duration };
    this._toast.set(toast);
    setTimeout(() => this._toast.set(null), duration);
  }

  success(msg: string, description?: string) { this.show(msg, description, 'success'); }
  error(msg: string, description?: string)   { this.show(msg, description, 'error'); }
  info(msg: string, description?: string)    { this.show(msg, description, 'info'); }
  warning(msg: string, description?: string) { this.show(msg, description, 'warning'); }

  clear() { this._toast.set(null); }
}
