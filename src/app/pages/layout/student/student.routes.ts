import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'info',
    pathMatch: 'full',
  },
  {
    // 學生基本資料頁
    path: 'info',
    loadComponent: () => import('./info/info'),
  },
  {
    // 學生收藏課程頁
    path: 'favorites',
    loadComponent: () => import('./favorites/favorites'),
  },
  {
    // 學生行事曆頁
    path: 'calendar',
    loadComponent: () => import('./calendar/calendar'),
  },
  {
    // 學生已購買課程頁
    path: 'courses',
    loadComponent: () => import('./courses/courses'),
  },
  {
    // 學生交易紀錄頁
    path: 'record',
    loadComponent: () => import('./record/record'),
  },
];

export default routes;
