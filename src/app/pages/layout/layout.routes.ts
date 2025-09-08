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
  {
    // 搜尋結果頁 - 標籤
    path: 'result-tag',
    loadComponent: () => import('./result-tag/result-tag'),
  },
  {
    // 搜尋結果頁 - 關鍵字
    path: 'result-keyword',
    loadComponent: () => import('./result-keyword/result-keyword'),
  },
  {
    // 課程詳情頁
    path: 'course-detail/:id',
    loadComponent: () => import('./course-detail/course-detail'),
  },
  {
    // 購物車
    path: 'cart',
    loadComponent: () => import('./cart/cart'),
  },
];

export default routes;
