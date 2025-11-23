import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'main',
        loadComponent: () => import('./features/main/main').then(m => m.Main),
        loadChildren: () => import('./features/main/main.routes').then(m => m.routes),
        canActivate: [authGuard]
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
        loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.routesAdmin),
        canActivate: [adminGuard]
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login)
    },
    {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register').then(m => m.Register)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];
