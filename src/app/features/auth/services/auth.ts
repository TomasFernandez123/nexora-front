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
  };
  path: string;
  timestamp: string;
};

export type userModify = {
  success: boolean;
  message: string;
  data: User;
  path: string;
  timestamp: string;
}

export type userRegister = { 
  success: boolean;
  message: string;
  data: {
    user: User;
  };
  path: string;
  timestamp: string;
};

export type userLogout = {
  success: boolean;
  message: string;
}

export type User = {
  _id: string,
  name: string,
  lastName: string,
  email: string,
  username: string,
  password: string,
  dateOfBirth: Date,
  description: string,
  photo: string,
  createdAt: Date,
  isActive: boolean,
  role: 'user'|'admin';
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private api = environment.apiBaseUrl;
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private sessionTimer: any = null;
  private warningShow = false;
  public sessionWarningModal: any = null;

  user = signal<User | null>(null);

  isLoggedIn = computed(() => !!this.user());

  login(credentials: loginCredentials): Observable<userLogged> {
    return this.http.post<userLogged>(`${this.api}/auth/login`, credentials, {withCredentials: true});
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

    return this.http.post<userRegister>(`${this.api}/auth/register`, formData)
  }

  modifyUser(userId: string, credentials: Partial<registerCredentials>): Observable<userModify> {
    return this.http.patch<userModify>(`${this.api}/users/${userId}`, credentials, {withCredentials: true});
  }

  deleteUser(userId: string): Observable<{ data: User; message: string; }> {
    return this.http.delete<{ data: User; message: string; }>(`${this.api}/users/${userId}`, {withCredentials: true});
  }

  logout(): Observable<userLogout> {
    this.clearSessionTimer();
    return this.http.post<userLogout>(`${this.api}/auth/logout`, {}, {withCredentials: true});
  }

  getCurrentUser(): Observable<User | null> {
    return this.http.post<any>(`${this.api}/auth/authorize`, {}, {withCredentials: true}).pipe(
      catchError(() => of(null))
    );
  }

  loadUser() {
    this.getCurrentUser().subscribe((user) => {
      if (user) {
        this.user.set(user);
        this.startSessionTimer();
      } else {
        this.user.set(null);
      }
    })
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`, {withCredentials: true});
  }

  startSessionTimer() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);

    this.warningShow = false;

    console.log("Iniciando timer de sesión");

    this.sessionTimer = setTimeout(() => {
      this.showSessionWarning();
    },  5 * 60 * 1000); // 5 minutos
  }

  private showSessionWarning() {
    if (this.warningShow) return;
    this.warningShow = true;

    if (this.sessionWarningModal) {
      this.sessionWarningModal.show();
    }
  }

  handleExtendSession() {
    this.refreshSession();
  }

  handleCancelSession() {
    this.logout().subscribe();
  }

  refreshSession() {
    this.http.post(`${this.api}/auth/refresh-token`, {}, { withCredentials: true }).subscribe({
      next: (res) => {
        this.warningShow = false;
        this.startSessionTimer();
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  clearSessionTimer() {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.sessionTimer = null;
  }

}
