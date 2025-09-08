import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up'),
  },
  {
    path: 'send-email',
    loadComponent: () => import('./pages/send-email/send-email'),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password'),
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-layout/dashboard-layout'),
    loadChildren: () => import('./pages/dashboard-layout/dashboard-layout.routes'),
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout'),
    loadChildren: () => import('./pages/layout/layout.routes'),
  },
  {
    // 404 頁
    path: 'not-found',
    loadComponent: () => import('./pages/not-found-page/not-found-page')
  },
  {
    path: '**',
    redirectTo: 'not-found',
  },
];
