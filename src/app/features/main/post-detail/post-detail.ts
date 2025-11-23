import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Posts, postSchema } from '../../../core/services/posts';
import { Post } from '../../../shared/components/post/post';
import { Auth } from '../../auth/services/auth';
import { Spinner } from "../../../shared/components/spinner/spinner";

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [Post, Spinner],
  templateUrl: './post-detail.html',
})
export class PostDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private postSvc = inject(Posts);
  readonly auth = inject(Auth);

  post = signal<postSchema | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  commentLimit = 5;
  commentOffset = 0;

  loadingPost = this.postSvc.loading;

  ngOnInit() {
    this.postSvc.loading.set(true);

    const postId = this.route.snapshot.paramMap.get('id');
    
    if (!postId) {
      this.router.navigate(['/main/posts']);
      return;
    }

    this.loadPost(postId);

    this.postSvc.loading.set(false);
  }

  loadPost(postId: string) {
    this.loading.set(true);
    this.error.set(null);

    this.postSvc.getPostById(postId, this.commentLimit, this.commentOffset).subscribe({
      next: (res) => {
        this.post.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading post:', err);
        this.error.set('No se pudo cargar la publicación');
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/main/posts']);
  }
}
