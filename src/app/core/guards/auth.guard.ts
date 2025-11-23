import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';
import { of, switchAll, switchMap } from 'rxjs';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if(auth.user()) {
    return true;
  }

  return auth.getCurrentUser().pipe(
    switchMap((user) => {
      if(user) {
        auth.user.set(user);
        return of(true);
      } else {
        router.navigateByUrl('/login');
        return of(false);
      }
    })
  );
};

export const adminGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if(auth.user() && auth.user()?.role === 'admin') {
    return true;
  }

  return auth.getCurrentUser().pipe(
    switchMap((user) => {
      if(user && user.role === 'admin') {
        auth.user.set(user);
        return of(true);
      } else {
        router.navigateByUrl('/main');
        return of(false);
      }
    })
  );
};