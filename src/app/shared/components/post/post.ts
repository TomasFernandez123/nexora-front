import { DatePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Posts } from '../../../core/services/posts';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.html',
})
export class Post {
  readonly postSvc = inject(Posts);

  title = input<string>('Post Title');
  content = input<string>('This is the content of the post.');
  author = input<string>('Author Name');
  authorPhoto = input<string|null>(null);
  imageUrl = input<string|null>();
  date = input<string>(new Date().toLocaleDateString());
  id = input.required<string>();

  likePost() {
    this.postSvc.likePost(this.id()).subscribe({
      next: (res) => {
        console.log('Post liked:', res);
      },
      error: (err) => {
        console.error('Error liking post:', err);
      }
    });
  }

}
