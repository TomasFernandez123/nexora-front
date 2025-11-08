import { Component, inject, OnInit } from '@angular/core';
import { Auth } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";
import { CreatePost } from "../../../shared/components/create-post/create-post";
import { Posts } from '../../../core/services/posts';

@Component({
  selector: 'app-home',
  imports: [Post, CreatePost],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  readonly auth = inject(Auth); 
  private readonly postSvc = inject(Posts);

  posts = this.postSvc.post;

  ngOnInit() {
    this.postSvc.getAllPost();
  }
}
