import { Routes } from '@angular/router';
import { guestGuard, authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login'),
    canActivate: [guestGuard],
  },
  {
    path: 'sign-up',
    loadComponent: () => import('./pages/sign-up/sign-up'),
    canActivate: [guestGuard],
  },
  {
    path: 'send-email',
    loadComponent: () => import('./pages/send-email/send-email'),
    canActivate: [guestGuard],
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password'),
    canActivate: [guestGuard],
  },
  {
    path: 'teacher-apply',
    loadComponent: () => import('./pages/teacher-apply/teacher-apply'),
    // canActivate: [authGuard],
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard-layout/dashboard-layout'),
    loadChildren: () => import('./pages/dashboard-layout/dashboard-layout.routes'),
    canActivate: [authGuard],
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
