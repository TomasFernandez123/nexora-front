import { Component, computed, inject } from '@angular/core';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  imports: [],
  templateUrl: './toast.html',
  styleUrls: ['./toast.scss']
})
export class ToastComponent {
  private toastService = inject(Toast);

  toast = computed(() => this.toastService.toast());

  dismiss() {
    this.toastService.clear();
  }
}
