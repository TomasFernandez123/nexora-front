import { Component, EventEmitter, Input, Output, signal } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss'
})
export class ConfirmModal {
  open = signal(false);

  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de continuar?';
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  show() { 
    this.open.set(true); 
  }
  
  hide() { 
    this.open.set(false); 
  }
  
  onConfirm() { 
    this.confirm.emit(); 
    this.hide(); 
  }
  
  onCancel() { 
    this.cancel.emit(); 
    this.hide(); 
  }
}
