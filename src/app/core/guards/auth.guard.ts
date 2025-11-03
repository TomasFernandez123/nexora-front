import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../features/auth/services/auth';

export const authGuard = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
