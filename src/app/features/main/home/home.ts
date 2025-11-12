import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Auth } from '../../auth/services/auth';
import { Post } from "../../../shared/components/post/post";
import { CreatePost } from "../../../shared/components/create-post/create-post";
import { Posts } from '../../../core/services/posts';
import { Spinner } from '../../../shared/components/spinner/spinner';

@Component({
  selector: 'app-home',
  imports: [Post, CreatePost, Spinner],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  readonly auth = inject(Auth); 
  private readonly postSvc = inject(Posts);

  posts = this.postSvc.post;
  total = this.postSvc.total;
  limit = this.postSvc.limit;
  offset = this.postSvc.offset;
  loading = this.postSvc.loading;

  sort = signal<'recent' | 'likes'>('recent');
  userName = signal('');

  currentPage = computed(() => Math.floor(this.offset() / this.limit()) + 1);
  totalPages = computed(() => Math.ceil(this.total() / this.limit()));

  ngOnInit() {
    this.loadPage(1);
  }

  loadPage(page: number) {
    const offset = (page - 1) * this.limit();
    this.postSvc.getAllPost(this.limit(), offset, this.sort(), this.userName());

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onChangeSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'recent' | 'likes';
    this.sort.set(value);
    this.loadPage(1);
  }

  onSearch(input: string) {
    this.userName.set(input);
    this.loadPage(1);
  }

  onReset() {
    this.userName.set('');
    this.sort.set('recent');
    this.loadPage(1);
  }
}
