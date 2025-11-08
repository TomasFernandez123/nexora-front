import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../utils/forms-utils';
import { Auth } from '../../../features/auth/services/auth';
import { Posts } from '../../../core/services/posts';
import { Toast } from '../../../core/services/toast';

@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.html',
})
export class CreatePost {
  private fb = inject(FormBuilder);
  readonly auth = inject(Auth);
  private readonly postSvc = inject(Posts)
  private readonly toastSvc = inject(Toast);
  formUtils = FormUtils;

  openModal = signal(false);
  loading = signal(false);
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  createPostForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(500)]],
    photo: ['']
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      this.selectedImage.set(file);
      this.createPostForm.patchValue({ photo: file });
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.createPostForm.patchValue({ photo: '' });
  }

  closeModal() {
    this.openModal.set(false);
    this.createPostForm.reset();
    this.removeImage();
  }

  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (this.createPostForm.invalid) {
      this.createPostForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    const credentials = this.createPostForm.value;

    this.postSvc.createPost(credentials).subscribe({
      next: (res) => {
        this.openModal.set(false);
        this.toastSvc.success('Post created successfully');
        this.postSvc.post.update(posts => [res, ...posts]);
      },

      error: (err) => {
        const errorMessage = err.error?.message || err.error?.error || 'Error logging in. Please try again.';
        this.toastSvc.error('Error creating the post', errorMessage);
      }
    })
  }
}
