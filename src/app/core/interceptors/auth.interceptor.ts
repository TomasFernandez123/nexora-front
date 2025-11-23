import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';
import { catchError, throwError } from 'rxjs';
import { Toast } from '../services/toast';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const router = inject(Router);
  const auth = inject(Auth);
  const toast = inject(Toast);

  const clonedReq = req.clone({
    withCredentials: true
  });

  return next(clonedReq).pipe(
    catchError(err => {
      if (err.status === 401) {
        toast.error('Session expired', 'Please log in again.');

        auth.user.set(null);
        auth.clearSessionTimer();

        router.navigate(['/login']);
      }

      return throwError(() => err);
    })
  );
};
