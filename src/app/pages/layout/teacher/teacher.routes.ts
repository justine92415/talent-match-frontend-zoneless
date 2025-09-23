import { Routes } from '@angular/router';
import { createRoleGuard } from '@app/guards/role.guard';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';
import { Router } from '@angular/router';

// 專門檢查 teacher_pending 角色的守衛
const teacherPendingGuard = createRoleGuard('teacher_pending');
// 專門檢查 teacher 角色的守衛
const teacherOnlyGuard = createRoleGuard('teacher');

// 智能重定向守衛
const teacherRedirectGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const userRoles = authService.roles();

  if (userRoles.includes('teacher')) {
    router.navigate(['/dashboard/teacher/info']);
  } else if (userRoles.includes('teacher_pending')) {
    router.navigate(['/dashboard/teacher/apply-status']);
  } else {
    router.navigate(['/dashboard/teacher/apply-status']); // 預設
  }

  return false; // 總是返回 false 來觸發重定向
};

const routes: Routes = [
  {
    path: '',
    canActivate: [teacherRedirectGuard],
    children: []
  },
  {
    // 教師申請狀態頁面 - 只有 teacher_pending 角色可訪問
    path: 'apply-status',
    loadComponent: () => import('./apply-status/apply-status'),
    canActivate: [teacherPendingGuard],
  },
  {
    // 教師基本資訊管理頁 - 只有 teacher 角色可訪問
    path: 'info',
    loadComponent: () => import('./info/info'),
    canActivate: [teacherOnlyGuard],
  },
  {
    // 老師影片管理頁
    path: 'videos',
    loadComponent: () => import('./videos/videos'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 可預約時段管理頁
    path: 'schedule',
    loadComponent: () => import('./schedule/schedule'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 學生預約查看頁
    path: 'reservation',
    loadComponent: () => import('./reservation/reservation'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 老師課程管理頁
    path: 'courses',
    loadComponent: () => import('./courses/courses'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 新增課程頁
    path: 'courses/create',
    loadComponent: () => import('./courses/create/create'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 課程檢視頁
    path: 'courses/view/:id',
    loadComponent: () => import('./courses/view/view'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 課程編輯頁
    path: 'courses/edit/:id',
    loadComponent: () => import('./courses/edit/edit'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
  {
    // 老師交易紀錄頁
    path: 'record',
    loadComponent: () => import('./record/record'),
    canActivate: [teacherOnlyGuard],
    data: { state: 'teacher' },
  },
];

export default routes;
