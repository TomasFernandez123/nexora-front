import { Component, input } from '@angular/core';

@Component({
  selector: 'app-post',
  imports: [],
  templateUrl: './post.html',
})
export class Post {
  title = input<string>('Post Title');
  content = input<string>('This is the content of the post.');
  author = input<string>('Author Name');
  imageUrl = input<string>();
}
