import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'info',
    pathMatch: 'full',
  },
  {
    // 教師資訊管理管理頁
    path: 'info',
    loadComponent: () => import('./info/info'),
  },
  {
    // 老師影片管理頁
    path: 'videos',
    loadComponent: () => import('./videos/videos'),
    data: { state: 'teacher' },
  },
  {
    // 老師課程預約管理頁
    path: 'reservation',
    loadComponent: () => import('./reservation/reservation'),
    data: { state: 'teacher' },
  },
  {
    // 老師課程管理頁
    path: 'courses',
    loadComponent: () => import('./courses/courses'),
    data: { state: 'teacher' },
  },
  {
    // 老師交易紀錄頁
    path: 'record',
    loadComponent: () => import('./record/record'),
    data: { state: 'teacher' },
  },
];

export default routes;
