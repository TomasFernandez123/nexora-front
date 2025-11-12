import { DatePipe } from '@angular/common';
import { Component, inject, input, signal, computed, OnInit, ViewChild } from '@angular/core';
import { comment, Posts } from '../../../core/services/posts';
import { Auth } from '../../../features/auth/services/auth';
import { FormsModule } from '@angular/forms';
import { ConfirmModal } from '../confirm-modal/confirm-modal';

@Component({
  selector: 'app-post',
  imports: [DatePipe, FormsModule, ConfirmModal],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post implements OnInit {
  readonly postSvc = inject(Posts);
  readonly auth = inject(Auth);

  title = input<string>('Post Title');
  content = input<string>('This is the content of the post.');
  author = input<string>('Author Name');
  authorPhoto = input<string|null>(null);
  imageUrl = input<string|null>();
  date = input<string>(new Date().toLocaleDateString());
  id = input.required<string>();
  mediaType = input<'image' | 'video' | null>(null);

  likes = input<string[]>([]);
  likeCount = input<number>(0);
  commentCount = input<number>(0);
  comments = input<comment[]>([])

  @ViewChild('confirmModal') confirmModal!: ConfirmModal;

  localLikes = signal<string[]>([]);
  localLikeCount = signal<number>(0);
  localCommentCount = signal<number>(0);

  showCommentModal = signal(false);
  commentText = signal('');
  commentLoading = signal(false);
  maxCommentLength = 100;

  commentCharCount = computed(() => this.commentText().length);
  commentCharsRemaining = computed(() => this.maxCommentLength - this.commentText().length);
  isCommentValid = computed(() => {
    const text = this.commentText().trim();
    return text.length > 0 && text.length <= this.maxCommentLength;
  });

  loading = this.postSvc.loading;

  isLiked = computed(() => {
    const userId = this.auth.user()?._id;
    if (!userId) return false;
    return this.localLikes().includes(userId) || this.likes().includes(userId);
  });

  isMine = computed(() => {
    const userId = this.auth.user()?._id;
    
    if (!userId) return false;

    return this.author() === this.auth.user()?.username;
  })

  ngOnInit() {
    this.localLikes.set(this.likes());
    this.localLikeCount.set(this.likeCount());
    this.localCommentCount.set(this.commentCount());
  }

  likePost() {
    const userId = this.auth.user()?._id;
    if (!userId) return;
    this.loading.set(true);

    this.postSvc.likePost(this.id()).subscribe({
      next: (res) => {
        console.log(res);
        this.localLikes.set(res.data.likes);
        this.localLikeCount.set(res.data.likeCount);

        this.postSvc.post.update(posts => {
          return posts.map(post => {
            if (post._id === this.id()) {
              return {
                ...post,
                likes: res.data.likes,
                likeCount: res.data.likeCount
              };
            }
            return post;
          });
        });

        this.postSvc.myPosts.update(posts => {
          return posts.map(post => {
            if (post._id === this.id()) {
              return {
                ...post,
                likes: res.data.likes,
                likeCount: res.data.likeCount
              };
            }
            return post;
          });
        });
      },
      error: (err) => {
        console.error('Error liking post:', err);
      },
      complete: () => {
        this.loading.set(false);
      }
    });
  }

  openCommentModal() {
    this.showCommentModal.set(!this.showCommentModal());
  }

  closeCommentModal() {
    this.showCommentModal.set(false);
    this.commentText.set('');
  }

  submitComment() {
    const text = this.commentText().trim();
    if (!text || text.length > this.maxCommentLength) return;

    this.commentLoading.set(true);

    this.postSvc.commentPost(this.id(), text).subscribe({
      next: (res) => {
        this.localCommentCount.set(res.data.commentCount);
        
        this.postSvc.post.update(posts => {
          return posts.map(post => {
            if (post._id === this.id()) {
              return { ...post, commentCount: res.data.commentCount, comments: res.data.comments };
            }
            return post;
          });
        });

        this.postSvc.myPosts.update(posts => {
          return posts.map(post => {
            if (post._id === this.id()) {
              return { ...post, commentCount: res.data.commentCount, comments: res.data.comments };
            }
            return post;
          });
        });

        this.closeCommentModal();
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.commentLoading.set(false);
      },
      complete: () => {
        this.commentLoading.set(false);
      }
    });
  }

  openDeleteConfirm() {
    this.confirmModal.show();
  }

  confirmDelete() {
    this.deletePost();
  }

  cancelDelete() {
    // El modal se cierra automáticamente
  }

  deletePost() {
    this.loading.set(true);

    this.postSvc.deletePost(this.id()).subscribe({
      next: (res) => {
        this.postSvc.post.update(posts => posts.filter(post => post._id !== this.id()));
        this.postSvc.myPosts.update(posts => posts.filter(post => post._id !== this.id()));

        this.postSvc.getAllPost(this.postSvc.limit(), this.postSvc.offset());
        this.postSvc.getMyPosts(this.auth.user()?._id!);
      },
      error: (err) => {
        console.error('Error deleting post:', err);
      },
      complete: () => {
        this.loading.set(false);
      }
    })
  }
}
