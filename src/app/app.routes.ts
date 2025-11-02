import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'main',
        loadComponent: () => import('./features/main/main').then(m => m.Main),
        loadChildren: () => import('./features/main/main.routes').then(m => m.routes)
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
