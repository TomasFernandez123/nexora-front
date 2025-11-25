import { Component, inject, input, signal, computed, OnInit, ViewChild } from '@angular/core';
import { comment, Posts } from '../../../core/services/posts';
import { Auth } from '../../../features/auth/services/auth';
import { FormsModule } from '@angular/forms';
import { ConfirmModal } from '../confirm-modal/confirm-modal';
import { CommentModal } from '../comment-modal/comment-modal';
import { Router } from '@angular/router';
import { EditCommentModal } from '../edit-comment-modal/edit-comment-modal';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { UsernameFormatPipe } from '../../pipes/username-format.pipe';
import { RippleDirective } from '../../directives/ripple.directive';

@Component({
  selector: 'app-post',
  imports: [FormsModule, ConfirmModal, CommentModal, EditCommentModal, TimeAgoPipe, UsernameFormatPipe, RippleDirective],
  templateUrl: './post.html',
  styleUrl: './post.scss',
})
export class Post implements OnInit {
  readonly postSvc = inject(Posts);
  readonly auth = inject(Auth);
  private router = inject(Router);

  title = input<string>('Post Title');
  content = input<string>('This is the content of the post.');
  author = input<string>('Author Name');
  authorPhoto = input<string|null>(null);
  imageUrl = input<string|null>();
  date = input<string>(new Date().toLocaleDateString());
  id = input.required<string>();
  mediaType = input<'image' | 'video' | null>(null);
  commentsPagination = input<{
    total: number,
    limit: number,
    offset: number,
    hasMore: boolean
  }>();

  likes = input<string[]>([]);
  likeCount = input<number>(0);
  commentCount = input<number>(0);
  comments = input<comment[]>([])
  isDetailView = input<boolean>(false);

  @ViewChild('confirmModal') confirmModal!: ConfirmModal;
  @ViewChild('commentModal') commentModal!: CommentModal;
  @ViewChild('editCommentModal') editCommentModal!: EditCommentModal;

  localLikes = signal<string[]>([]);
  localLikeCount = signal<number>(0);
  localCommentCount = signal<number>(0);
  loadedComments = signal<comment[]>([]);
  commentOffset = signal(0);
  commentLimit = signal(5);
  commentTotal = signal(0);
  commentHasMore = signal(false);
  commentLoadMoreLoading = signal(false);
  likeLoading = signal(false);

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

  canEditComment(comment: comment) {
    const userId = this.auth.user()?._id;
    if (!userId) return false;

    return comment.author._id === userId;
  }

  ngOnInit() {
    this.localLikes.set(this.likes());
    this.localLikeCount.set(this.likeCount());
    this.localCommentCount.set(this.commentCount());

    this.loadedComments.set(this.comments());

    const pag = this.commentsPagination();
    if (pag) {
      this.commentOffset.set(pag.limit);
      this.commentLimit.set(pag.limit);
      this.commentTotal.set(pag.total);
      this.commentHasMore.set(pag.hasMore);
    }
  }

  loadMoreComments() {
    if (!this.commentHasMore() || this.commentLoadMoreLoading()) return;

    this.commentLoadMoreLoading.set(true);

    this.postSvc.getPostById(
      this.id(),
      this.commentLimit(),
      this.commentOffset()
    ).subscribe({
      next: (res) => {
        const newComments = res.comments;

        this.loadedComments.set([
          ...this.loadedComments(),
          ...newComments
        ]);

        this.commentOffset.set(this.loadedComments().length);

        this.commentHasMore.set(res.commentsPagination.hasMore);
      },
      error: (err) => {
        console.error('Error loading more comments:', err);
        this.commentLoadMoreLoading.set(false);
      },
      complete: () => this.commentLoadMoreLoading.set(false)
    });
  }


  likePost() {
    const userId = this.auth.user()?._id;
    if (!userId) return;
    this.loading.set(true);

    this.postSvc.likePost(this.id()).subscribe({
      next: (res) => {
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

  navigateToDetail(event?: MouseEvent) {
    this.loading.set(true);
    if (this.isDetailView()) return;
    
    this.router.navigate(['/main/posts', this.id()]);
  }

  openCommentModal(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.commentModal.show(this.id(), this.title(), this.content());
  }

  openEditCommentModal(commentId: string, commentText: string) {
    this.editCommentModal.show(commentId, commentText);
  }

  editComment(text: string) {
    const commentId = this.editCommentModal.commentId();
    
    this.postSvc.editComment(this.id(), commentId, text).subscribe({
      next: (res) => {
        this.loadedComments.update(comments => 
          comments.map(comment => 
            comment._id === commentId 
              ? { ...comment, text, edited: true }
              : comment
          )
        );

        this.postSvc.post.update(posts => {
          return posts.map(post => {
            if (post._id === this.id()) {
              return {
                ...post,
                comments: post.comments.map(comment => 
                  comment._id === commentId 
                    ? { ...comment, text, edited: true }
                    : comment
                )
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
                comments: post.comments.map(comment => 
                  comment._id === commentId 
                    ? { ...comment, text, edited: true }
                    : comment
                )
              };
            }
            return post;
          });
        });

        this.editCommentModal.hide();
      },
      error: (err) => {
        console.error('Error editing comment:', err);
        this.editCommentModal.resetSubmitting();
      },
      complete: () => {
        this.editCommentModal.resetSubmitting();
      }
    });
  }

  submitComment(text: string) {
    this.postSvc.commentPost(this.id(), text).subscribe({
      next: (res) => {
        this.localCommentCount.set(res.data.commentCount);
        
        this.loadedComments.update(comments => [res.data.comments[res.data.comments.length - 1], ...comments]);
        
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

        this.commentModal.hide();

        if (!this.isDetailView()) {
          this.router.navigate(['/main/posts', this.id()]);
        }
      },
      error: (err) => {
        console.error('Error adding comment:', err);
        this.commentModal.resetSubmitting();
      },
      complete: () => {
        this.commentModal.resetSubmitting();
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
  }

  deletePost() {
    this.loading.set(true);

    this.postSvc.deletePost(this.id()).subscribe({
      next: (res) => {
        this.postSvc.post.update(posts => posts.filter(post => post._id !== this.id()));
        this.postSvc.myPosts.update(posts => posts.filter(post => post._id !== this.id()));

        this.postSvc.getAllPost(this.postSvc.limit(), this.postSvc.offset());
        this.postSvc.getMyPosts(this.auth.user()?._id!);

        if(this.isDetailView()) {
          this.router.navigateByUrl('/main/post')
        }
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
