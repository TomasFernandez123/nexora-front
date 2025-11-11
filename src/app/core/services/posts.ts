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
  shareCount: number;
  saveCount: number;
  _id: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class Posts {
  private api = environment.apiBaseUrl;
  private readonly http: HttpClient = inject(HttpClient);

  post = signal<postSchema[]>([]);
  myPosts = signal<postSchema[]>([]);

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

  getAllPost() {
    this.http.get<GetAllPostsResponse>(`${this.api}/posts`).subscribe({
      next: (res) => {
        this.post.set(res.posts);
        console.log(res.posts);
      }
    })
  }

  getMyPosts(id: string) {
    this.http.get<GetAllPostsResponse>(`${this.api}/posts?userId=${id}&limit=3`).subscribe({
      next: (res) => {
        this.myPosts.set(res.posts);
      }
    })
  }
}
