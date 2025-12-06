import { Component, signal, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [],
  templateUrl: './image-modal.html',
  styleUrl: './image-modal.scss'
})
export class ImageModal {
  open = signal(false);
  imageUrl = signal<string>('');
  mediaType = signal<'image' | 'video'>('image');

  @Output() close = new EventEmitter<void>();

  show(url: string, type: 'image' | 'video' = 'image') {
    this.imageUrl.set(url);
    this.mediaType.set(type);
    this.open.set(true);
  }

  hide() {
    this.open.set(false);
    this.close.emit();
  }

  onBackdropClick() {
    this.hide();
  }
}
