import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    // 首頁
    path: 'home',
    loadComponent: () => import('./home/home'),
  },
];

export default routes;
