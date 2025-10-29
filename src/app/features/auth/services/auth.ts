import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { Router } from '@angular/router';

export type loginCredentials = {
  email?: string;
  userName?: string;
  password: string;
};

export type registerCredentials = {
  name: string,
  lastName: string,
  email: string,
  userName: string,
  date: string,
  password: string,
  description: string,
  photo: File;
}

export type userLogged = { 
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
  path: string;
  timestamp: string;
};

export type userRegister = { 
  success: boolean;
  message: string;
  data: {
    user: User;
  };
  path: string;
  timestamp: string;
};

export type User = {
  _id: string,
  name: string,
  lastName: string,
  email: string,
  password: string,
  dateOfBirth: Date,
  description: string,
  photo: string,
  role: 'user'|'admin';
}


@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api = `${environment.apiBaseUrl}/auth`
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router = inject(Router);

  user = signal<User | null>(null);
  token = signal<string | null>(localStorage.getItem('token'));

  isLoggedIn = computed(() => !!this.user());

  login(credentials: loginCredentials): Observable<userLogged> {
    return this.http.post<userLogged>(`${this.api}/login`, credentials);
  }

  register(credentials: registerCredentials): Observable<userRegister> {
    const formData = new FormData();
    formData.append('name', credentials.name);
    formData.append('lastName', credentials.lastName);
    formData.append('email', credentials.email);
    formData.append('username', credentials.userName); 
    formData.append('password', credentials.password);
    formData.append('dateOfBirth', credentials.date); 
    formData.append('description', credentials.description);
    formData.append('photo', credentials.photo); 

    return this.http.post<userRegister>(`${this.api}/register`, formData)
  }

  logout() {
    localStorage.removeItem('token');
    this.token.set(null);
    this.user.set(null);

    this.router.navigateByUrl('/login');
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.token.set(token);
  }

  getCurrentUser(): Observable<User | null> {
    if(!this.token()) return of(null);

    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token()}`});
    return this.http.post<any>(`${this.api}/authorize`, {}, { headers }).pipe(
      catchError(() => of(null)),
    );
  }

  loadUser() {
    this.getCurrentUser().subscribe((user) => {
      this.user.set(user);
    })
  }
}
