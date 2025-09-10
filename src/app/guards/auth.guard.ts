import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthStateService } from '../services/auth-state.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  // 檢查是否有 token（同步方法）
  const hasToken = authStateService.hasToken();
  
  if (hasToken) {
    return true;
  } else {
    // 未登入時導向登入頁面，並記住原本要去的頁面
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};

// 已登入使用者不能訪問的頁面（如登入、註冊頁面）
export const guestOnlyGuard: CanActivateFn = (route, state) => {
  const authStateService = inject(AuthStateService);
  const router = inject(Router);

  // 檢查是否有 token（同步方法）
  const hasToken = authStateService.hasToken();
  
  if (!hasToken) {
    return true;
  } else {
    // 已登入時導向首頁
    router.navigate(['/']);
    return false;
  }
};