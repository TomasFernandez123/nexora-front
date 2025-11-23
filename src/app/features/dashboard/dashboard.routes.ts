import { Routes } from '@angular/router';

export const routesAdmin: Routes = [
    {
        path: 'users',
        loadComponent: () => import('./users/users').then(m => m.Users),
    },
    {
        path: 'stats',
        loadComponent: () => import('./stats/stats').then(m => m.Stats),
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'users'
    },
    {
        path: '**',
        redirectTo: 'users'
    }
];
