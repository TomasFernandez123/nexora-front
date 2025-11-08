import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type createPostCredentials = {
  title: string;
  message: string;
  photo?: File;
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

  createPost(credentials: createPostCredentials): Observable<postSchema> {
    const formData = new FormData();
    formData.append('title', credentials.title);
    formData.append('message', credentials.message);
    if (credentials.photo) {
      formData.append('photo', credentials.photo);
    }

    return this.http.post<postSchema>(`${this.api}/posts`, formData, { withCredentials: true });
  }

  getAllPost() {
    this.http.get<postSchema[]>(`${this.api}/posts`).subscribe({
      next: (res) => {
        this.post.set(res);
      }
    })
  }

  getMyPosts(id: string) {
    this.http.get<postSchema[]>(`${this.api}/posts?userId=${id}&limit=3`).subscribe({
      next: (res) => {
        this.myPosts.set(res);
      }
    })
  }
}
