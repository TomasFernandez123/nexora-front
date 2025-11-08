import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-post',
  imports: [DatePipe],
  templateUrl: './post.html',
})
export class Post {
  title = input<string>('Post Title');
  content = input<string>('This is the content of the post.');
  author = input<string>('Author Name');
  authorPhoto = input<string|null>(null);
  imageUrl = input<string|null>();
  date = input<string>(new Date().toLocaleDateString());
}
