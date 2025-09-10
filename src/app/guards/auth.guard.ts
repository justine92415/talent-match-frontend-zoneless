import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '@app/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // 未登入，重定向到登入頁面，並記錄原始 URL
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    // 已登入用戶不能訪問登入頁面，重定向到首頁
    router.navigate(['/']);
    return false;
  }
};