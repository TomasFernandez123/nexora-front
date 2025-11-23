import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'posts',
        loadComponent: () => import('./home/home').then(m => m.Home),
    },
    {
        path: 'posts/:id',
        loadComponent: () => import('./post-detail/post-detail').then(m => m.PostDetail),
    },
    {
        path: 'account',
        loadComponent: () => import('./account/account').then(m => m.Account)
    },
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'posts'
    },
    {
        path: '**',
        redirectTo: 'posts'
    }
];
