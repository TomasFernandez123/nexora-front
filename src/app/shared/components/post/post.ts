import { DatePipe } from '@angular/common';
import { Component, inject, input, signal, computed, OnInit } from '@angular/core';
import { Posts } from '../../../core/services/posts';
import { Auth } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.html',
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

  likes = input<string[]>([]);
  likeCount = input<number>(0);

  localLikes = signal<string[]>([]);
  localLikeCount = signal<number>(0);

  isLiked = computed(() => {
    const userId = this.auth.user()?._id;
    if (!userId) return false;
    return this.localLikes().includes(userId) || this.likes().includes(userId);
  });

  ngOnInit() {
    this.localLikes.set(this.likes());
    this.localLikeCount.set(this.likeCount());
  }

  likePost() {
    const userId = this.auth.user()?._id;
    if (!userId) return;

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
      }
    });
  }
}
