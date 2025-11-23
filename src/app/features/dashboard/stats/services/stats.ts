// src/app/core/services/stats.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBaseUrl}/post/stats`;

  private buildParams(from: string, to: string, extra?: Record<string, any>) {
    let params = new HttpParams().set('from', from).set('to', to);
    if (extra) {
      Object.entries(extra).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params = params.set(key, String(value));
        }
      });
    }
    return params;
  }

  getPostsPerUser(from: string, to: string, limit = 10) {
    const params = this.buildParams(from, to, { limit });
    return this.http.get<{
      fromDate: string;
      toDate: string;
      limit: number;
      top: { userId: string; username: string; name: string; lastName: string; postCount: number }[];
      others: number;
    }>(`${this.baseUrl}/posts-per-user`, { params });
  }

  getCommentsOverTime(from: string, to: string) {
    const params = this.buildParams(from, to);
    return this.http.get<{from: string; to: string; points: { date: string; commentCount: number }[];}>(`${this.baseUrl}/comments-over-time`, { params });
  }

  getCommentsPerPost(from: string, to: string, limit = 10) {
    const params = this.buildParams(from, to, { limit });
    return this.http.get<{fromDate: string; toDate: string; limit: number; top: { postId: string; title: string; commentCount: number }[]; others: number;}>(`${this.baseUrl}/comments-per-post`, { params });
  }
}
