import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'student',
    pathMatch: 'full',
  },
  {
    path: 'student',
    loadChildren: () => import('../layout/student/student.routes').then(m => m.default)
  },
  {
    path: 'teacher',
    loadChildren: () => import('../layout/teacher/teacher.routes').then(m => m.default)
  }
];

export default routes;