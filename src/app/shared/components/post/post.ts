import { DatePipe } from '@angular/common';
import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { comment, Posts } from '../../../core/services/posts';
import { Auth } from '../../../features/auth/services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post',
  imports: [DatePipe, FormsModule],
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

  localLikes = signal<string[]>([]);
  localLikeCount = signal<number>(0);
  localCommentCount = signal<number>(0);

  showCommentModal = signal(false);
  commentText = signal('');
  commentLoading = signal(false);

  loading = this.postSvc.loading;

  isLiked = computed(() => {
    const userId = this.auth.user()?._id;
    if (!userId) return false;
    return this.localLikes().includes(userId) || this.likes().includes(userId);
  });

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
    if (!text) return;

    this.commentLoading.set(true);

    this.postSvc.commentPost(this.id(), text).subscribe({
      next: (res) => {
        console.log(res)
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
        console.log('Comment added:', this.postSvc.post());
        console.log('Comment added:', this.postSvc.myPosts());
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
}
