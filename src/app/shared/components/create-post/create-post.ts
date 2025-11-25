import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormUtils } from '../../utils/forms-utils';
import { Auth } from '../../../features/auth/services/auth';
import { Posts } from '../../../core/services/posts';
import { Toast } from '../../../core/services/toast';
import { ScrollLockDirective } from '../../directives/scroll-lock.directive';

@Component({
  selector: 'app-create-post',
  imports: [ReactiveFormsModule, ScrollLockDirective],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss',
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
  selectedVideo = signal<File | null>(null);
  videoPreview = signal<string | null>(null);
  mediaType = signal<'image' | 'video' | null>(null);

  createPostForm: FormGroup = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(300)]],
    photo: ['']
  });

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      const fileType = file.type.split('/')[0];
      
      if (fileType === 'image') {

        if(file.size > 5 * 1024 * 1024) { 
          this.toastSvc.error('File too large', 'The selected image exceeds the 5MB size limit.');
          return;
        }

        this.selectedImage.set(file);
        this.selectedVideo.set(null);
        this.videoPreview.set(null);
        this.mediaType.set('image');
        this.createPostForm.patchValue({ photo: file });
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else if (fileType === 'video') {

        if(file.size > 5 * 1024 * 1024) { 
          this.toastSvc.error('File too large', 'The selected video exceeds the 5MB size limit.');
          return;
        }
        this.selectedVideo.set(file);
        this.selectedImage.set(null);
        this.imagePreview.set(null);
        this.mediaType.set('video');
        this.createPostForm.patchValue({ photo: file });
        
        const reader = new FileReader();
        reader.onload = (e) => {
          this.videoPreview.set(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  }

  removeImage() {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    this.selectedVideo.set(null);
    this.videoPreview.set(null);
    this.mediaType.set(null);
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

    console.log(this.createPostForm.value);

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
        this.postSvc.post.update(posts => [res.data, ...posts]);

        this.postSvc.offset.set(0);
        this.postSvc.getAllPost(this.postSvc.limit(), 0);
      },

      error: (err) => {
        const errorMessage = err.error?.message || err.error?.error || 'Error logging in. Please try again.';
        this.toastSvc.error('Error creating the post', errorMessage);
      },

      complete: () => {
        this.loading.set(false);
        this.createPostForm.reset();
        this.removeImage();
      }
    })
  }
}
