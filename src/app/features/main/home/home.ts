import { AfterViewInit, Component, computed, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
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
export class Home implements OnInit, AfterViewInit{
  readonly auth = inject(Auth); 
  private readonly postSvc = inject(Posts);

  @ViewChild('scrollSentinel') scrollSentinel!: ElementRef;
  private observer?: IntersectionObserver;


  posts = this.postSvc.post;
  total = this.postSvc.total;
  limit = this.postSvc.limit;
  offset = this.postSvc.offset;
  loading = this.postSvc.loading;

  sort = signal<'recent' | 'likes'>('recent');
  userName = signal('');

  currentPage = computed(() => Math.floor(this.offset() / this.limit()) + 1);
  totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  hasMorePosts = computed(() => this.currentPage() < this.totalPages());

  ngOnInit() {
    this.loadPage(1);
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  private setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && this.hasMorePosts() && !this.loading()) {
        this.loadPage(this.currentPage() + 1, true);
      }
    },
    {
      threshold: 1.0,
      rootMargin: '100px',
    }
    );

    if (this.scrollSentinel) {
      this.observer.observe(this.scrollSentinel.nativeElement);
    }
  }

  loadPage(page: number, append = false) {
    const offset = (page - 1) * this.limit();
    this.postSvc.getAllPost(this.limit(), offset, this.sort(), this.userName(), append);
  }

  onChangeSort(event: Event) {
    const value = (event.target as HTMLSelectElement).value as 'recent' | 'likes';
    this.sort.set(value);
    this.loadPage(1, false);
  }

  onSearch(input: string) {
    this.userName.set(input);
    this.loadPage(1, false);
  }

  onReset() {
    this.userName.set('');
    this.sort.set('recent');
    this.loadPage(1, false);
  }
}
