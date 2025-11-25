import { Component, signal, computed, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../features/auth/services/auth';
import { ScrollLockDirective } from '../../directives/scroll-lock.directive';

@Component({
  selector: 'app-edit-comment-modal',
  imports: [FormsModule, ScrollLockDirective],
  templateUrl: './edit-comment-modal.html',
  styleUrls: ['./edit-comment-modal.scss']
})
export class EditCommentModal {
  readonly auth = inject(Auth);

  open = signal(false);
  commentText = signal('');
  isSubmitting = signal(false);
  
  maxCommentLength = 100;

  commentId = signal<string>('');
  commentOldText = signal<string>('');

  commentCharCount = computed(() => this.commentText().length);
  commentCharsRemaining = computed(() => this.maxCommentLength - this.commentText().length);
  isCommentValid = computed(() => {
    const text = this.commentText().trim();
    return text.length > 0 && text.length <= this.maxCommentLength;
  });

  @Output() submit = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  show(commentId: string, commentOldText: string) {
    this.commentId.set(commentId);
    this.commentOldText.set(commentOldText);
    this.open.set(true);
    this.commentText.set(this.commentOldText());
    this.isSubmitting.set(false);
  }

  hide() {
    this.open.set(false);
    this.commentText.set('');
    this.cancel.emit();
  }

  onSubmit() {
    if (!this.isCommentValid() || this.isSubmitting()) return;
    
    this.isSubmitting.set(true);
    this.submit.emit(this.commentText().trim());
  }

  onCancel() {
    this.hide();
  }

  resetSubmitting() {
    this.isSubmitting.set(false);
  }
}
