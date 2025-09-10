import { Routes } from '@angular/router';
import { studentGuard, teacherGuard } from '@app/guards/role.guard';
import { dashboardRedirectGuard } from '@app/guards/role-redirect.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [dashboardRedirectGuard],
    children: []
  },
  {
    path: 'student',
    loadChildren: () => import('../layout/student/student.routes').then(m => m.default),
    canActivate: [studentGuard]
  },
  {
    path: 'teacher',
    loadChildren: () => import('../layout/teacher/teacher.routes').then(m => m.default),
    canActivate: [teacherGuard]
  }
];

export default routes;