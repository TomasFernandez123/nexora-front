import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type createPostCredentials = {
  title: string;
  message: string;
  photo?: File;
}

interface GetAllPostsResponse {
  total: number;
  limit: number;
  offset: number;
  posts: postSchema[];
}

export type GetPostResponse = {
  data: postSchema;
  message: string;
}

export type comment = {
  author: {
    _id: string;
    username: string;
    photo: string | null;
  };
  text: string;
  createdAt: string;
}

export type postSchema = {
  author: {
    _id: string;
    username: string;
    photo: string | null;
  };
  title: string;
  message: string;
  photo: string | null;
  likes: string[];
  likeCount: number;
  deleted: boolean;
  commentCount: number;
  comments: comment[]
  shareCount: number;
  saveCount: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
  mediaType: 'image' | 'video' | null;
}

@Injectable({
  providedIn: 'root'
})
export class Posts {
  private api = environment.apiBaseUrl;
  private readonly http: HttpClient = inject(HttpClient);

  post = signal<postSchema[]>([]);
  myPosts = signal<postSchema[]>([]);
  total = signal(0);
  limit = signal(5);
  offset = signal(0);
  loading = signal(false);

  createPost(credentials: createPostCredentials): Observable<GetPostResponse> {
    const formData = new FormData();
    formData.append('title', credentials.title);
    formData.append('message', credentials.message);
    if (credentials.photo) {
      formData.append('photo', credentials.photo);
    }

    return this.http.post<GetPostResponse>(`${this.api}/posts`, formData, { withCredentials: true });
  }

  likePost(postId: string): Observable<GetPostResponse> {
    return this.http.patch<GetPostResponse>(`${this.api}/posts/${postId}/like`, {}, { withCredentials: true });
  }

  commentPost(postId: string, text: string): Observable<GetPostResponse> {
    return this.http.post<GetPostResponse>(`${this.api}/posts/${postId}/comments`, { text }, { withCredentials: true });
  }

  getAllPost(limit = 5, offset = 0, sort: 'recent' | 'likes' = 'recent', userSearch = '') {
    console.log('Fetching posts with', { limit, offset, sort, userSearch });
    this.loading.set(true);
    this.http.get<GetAllPostsResponse>(`${this.api}/posts?limit=${limit}&offset=${offset}&sort=${sort}&userName=${userSearch}`, { withCredentials: true }).subscribe({
      next: (res) => {
        this.post.set(res.posts);
        this.total.set(res.total);
        this.limit.set(res.limit);
        this.offset.set(res.offset);
      },
      error: (err) => console.error('Error fetching posts:', err),
      complete: () => this.loading.set(false)
    });
  }

  getMyPosts(id: string) {
    this.loading.set(true);
    this.http.get<GetAllPostsResponse>(`${this.api}/posts?userId=${id}&limit=3`).subscribe({
      next: (res) => {
        this.myPosts.set(res.posts);
      },
      error: (err) => console.error('Error fetching my posts:', err),
      complete: () => this.loading.set(false)
    })
  }

  deletePost(postId: string): Observable<GetPostResponse> {
    return this.http.delete<GetPostResponse>(`${this.api}/posts/${postId}`, { withCredentials: true });
  }
}
