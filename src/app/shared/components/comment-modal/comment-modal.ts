import { Component, signal, computed, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-comment-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comment-modal.html',
  styleUrl: './comment-modal.scss',
})
export class CommentModal {
  readonly auth = inject(Auth);

  open = signal(false);
  commentText = signal('');
  isSubmitting = signal(false);
  
  maxCommentLength = 100;

  postId = signal<string>('');
  postTitle = signal<string>('');
  postContent = signal<string>('');

  commentCharCount = computed(() => this.commentText().length);
  commentCharsRemaining = computed(() => this.maxCommentLength - this.commentText().length);
  isCommentValid = computed(() => {
    const text = this.commentText().trim();
    return text.length > 0 && text.length <= this.maxCommentLength;
  });

  @Output() submit = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();

  show(postId: string, postTitle: string, postContent: string) {
    this.postId.set(postId);
    this.postTitle.set(postTitle);
    this.postContent.set(postContent);
    this.open.set(true);
    this.commentText.set('');
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
